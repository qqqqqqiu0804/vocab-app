/**
 * 从 ECDICT 全量词典（77 万词）切出标准考试词书，输出到 public/dicts/。
 *
 * 数据源：npm 包 ecdict@0.0.4 → assets/ecdict.csv（63MB）
 *   下载：node scripts/fetch-ecdict.js
 *
 * 产物：
 *   public/dicts/manifest.json  词书目录（id / name / count / desc）
 *   public/dicts/<id>.json      单本词书（紧凑格式，前端展开为 WordEntry）
 *   public/dicts/index.json     全部唯一词的精简索引（跨词书搜索 / 收藏还原用）
 *
 * 紧凑格式（为了体积）：
 *   { w: 拼写, p: 音标, m: [[词性, [释义…]], …], c: 柯林斯星级, o: 是否牛津核心 }
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSV = path.join(__dirname, '..', '.cache', 'package', 'assets', 'ecdict.csv');
const OUT_DIR = path.join(__dirname, '..', 'public', 'dicts');

/** 词书定义：ECDICT tag → 展示信息。order 决定首页排序。 */
const BOOKS = [
  { id: 'zk', tag: 'zk', name: '中考核心', desc: '初中阶段必备基础词' },
  { id: 'gk', tag: 'gk', name: '高考核心', desc: '高中阶段高频考纲词' },
  { id: 'cet4', tag: 'cet4', name: '四级词汇', desc: 'CET-4 大纲词汇' },
  { id: 'cet6', tag: 'cet6', name: '六级词汇', desc: 'CET-6 大纲词汇' },
  { id: 'ky', tag: 'ky', name: '考研词汇', desc: '考研英语大纲词汇' },
  { id: 'ielts', tag: 'ielts', name: '雅思词汇', desc: 'IELTS 高频词' },
  { id: 'toefl', tag: 'toefl', name: '托福词汇', desc: 'TOEFL 高频词' },
  { id: 'gre', tag: 'gre', name: 'GRE 词汇', desc: 'GRE 高阶词汇' },
];

/** 流式 CSV 解析（处理引号包裹、转义双引号、字段内换行） */
function* parseRows(text) {
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      yield row;
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    yield row;
  }
}

/** ECDICT 音标用的是 ә（西里尔）等异体字符，统一成标准 IPA 并包上斜杠 */
function normPhonetic(raw) {
  if (!raw) return '';
  const s = raw
    .trim()
    .replace(/ә/g, 'ə') // U+04D9 → U+0259
    .replace(/ɒ:/g, 'ɔː')
    .replace(/:/g, 'ː')
    .replace(/^\/+|\/+$/g, '')
    .trim();
  return s ? `/${s}/` : '';
}

/** 把 "vt. 放弃, 抛弃\nn. 放任" 解析成 [[词性, [释义…]], …] */
function parseMeanings(translation) {
  if (!translation) return [];
  // ECDICT 里换行是字面的两个字符 \ + n
  const lines = translation
    .split(/\\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const out = [];
  for (const line of lines) {
    // 词性形如：vt. / vi. / n. / a. / ad. / prep. / conj. / num. / [医] / [网络]
    const m = line.match(/^((?:[a-zA-Z]+\.\s*)+|\[[^\]]+\])\s*(.+)$/);
    let pos = '';
    let body = line;
    if (m) {
      pos = m[1].trim();
      body = m[2].trim();
    }
    const defs = body
      .split(/[,，;；]/)
      .map((s) => s.trim())
      .filter((s) => s && s.length <= 40);
    if (!defs.length) continue;
    // 同词性合并
    const exist = out.find((x) => x[0] === pos);
    if (exist) exist[1].push(...defs);
    else out.push([pos, defs]);
  }
  // 学科标注（[计] [医] [经] [网络]…）多为重复释义，只在没有真词性时才保留
  const isSubject = (pos) => pos.startsWith('[');
  const real = out.filter(([pos]) => pos && !isSubject(pos));
  const picked = real.length ? real : out;

  // 去重 + 每个词性最多 6 条释义，控制体积
  return picked
    .map(([pos, defs]) => [pos, [...new Set(defs)].slice(0, 6)])
    .slice(0, 4);
}

/** 过滤掉词组、专名、含非字母字符的条目——只保留可背诵的单词 */
function isGoodWord(w) {
  return /^[a-zA-Z][a-zA-Z-]{1,24}$/.test(w);
}

function main() {
  if (!fs.existsSync(CSV)) {
    console.error(`✗ 找不到词典源文件：${CSV}`);
    console.error('  请先运行：node scripts/fetch-ecdict.js');
    process.exit(1);
  }

  console.log('读取 ECDICT…');
  const text = fs.readFileSync(CSV, 'utf8');
  const it = parseRows(text);
  it.next(); // 跳过表头

  const byTag = {};
  for (const b of BOOKS) byTag[b.tag] = [];
  const indexMap = new Map();

  let scanned = 0;
  for (const r of it) {
    scanned++;
    const [word, phonetic, , translation, , collins, oxford, tag, bnc, frq] = r;
    if (!tag || !word || !isGoodWord(word)) continue;

    const tags = tag.split(/\s+/).filter(Boolean);
    const hit = BOOKS.filter((b) => tags.includes(b.tag));
    if (!hit.length) continue;

    const meanings = parseMeanings(translation);
    if (!meanings.length) continue;

    const entry = {
      w: word,
      p: normPhonetic(phonetic),
      m: meanings,
    };
    if (collins) entry.c = Number(collins) || 0;
    if (oxford === '1') entry.o = 1;

    // 词频用于排序：frq(COCA) 优先，退化到 bnc，都没有则排最后
    const rank = Number(frq) || Number(bnc) || 999999;

    for (const b of hit) byTag[b.tag].push({ entry, rank });
    if (!indexMap.has(word)) indexMap.set(word, entry);
  }

  console.log(`扫描 ${scanned} 行，命中 ${indexMap.size} 个唯一词。`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];
  for (const b of BOOKS) {
    // 按词频升序：常用词先背
    const words = byTag[b.tag].sort((x, y) => x.rank - y.rank).map((x) => x.entry);
    const file = path.join(OUT_DIR, `${b.id}.json`);
    fs.writeFileSync(file, JSON.stringify(words), 'utf8');
    const kb = (fs.statSync(file).size / 1024).toFixed(0);
    manifest.push({ id: b.id, name: b.name, desc: b.desc, count: words.length });
    console.log(`  ✓ ${b.name.padEnd(10)} ${String(words.length).padStart(5)} 词  ${kb}KB`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest), 'utf8');

  // 全局索引：搜索与收藏还原用，按字母序便于二分/前缀匹配
  const index = [...indexMap.values()].sort((a, b) => a.w.localeCompare(b.w));
  const idxFile = path.join(OUT_DIR, 'index.json');
  fs.writeFileSync(idxFile, JSON.stringify(index), 'utf8');
  console.log(
    `  ✓ 全局索引     ${String(index.length).padStart(5)} 词  ${(
      fs.statSync(idxFile).size / 1024
    ).toFixed(0)}KB`
  );

  console.log('\n完成 → public/dicts/');
}

main();
