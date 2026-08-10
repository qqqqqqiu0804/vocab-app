/**
 * 由「全量 ECDICT」生成「不背单词」词书（TS 模块）。
 *
 * 前置步骤：
 *   1. 下载 ECDICT 的 stardict.csv（约 37MB）：
 *      https://github.com/skywind3000/ECDICT  →  Releases 里的 stardict.csv
 *      放到 data/stardict.csv
 *   2. 准备考试词表（每行一个单词，纯小写/原拼写），例如 data/cet6-words.txt
 *
 * 运行：
 *   node scripts/build-wordlist.js [csvPath] [wordlistPath] [outTsPath] [bookId] [bookName]
 *
 * 说明：
 *   - ECDICT 本身不含例句，生成的词书 examples 为空（App 无例句时仍可正常学习）。
 *   - 解析 heuristic 已覆盖常见词性标签（n./v./vt./vi./adj./adv. 等）。
 *   - 想保留手写例句，可把脚本生成的 .gen.ts 与我们手写版手动合并。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = process.argv[2] || path.join(__dirname, '../data/stardict.csv');
const listPath = process.argv[3] || path.join(__dirname, '../data/cet6-words.txt');
const outPath = process.argv[4] || path.join(__dirname, '../src/data/cet6.gen.ts');
const bookId = process.argv[5] || 'cet6';
const bookName = process.argv[6] || '六级核心词';

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') { cur += '"'; i++; }
      else q = !q;
    } else if (c === ',' && !q) {
      out.push(cur); cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const POS_RE = /^(n\.|v\.|vt\.|vi\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|art\.|abbr\.|num\.|pl\.|sb\.|sth\.)\s*(.*)$/;

function parseMeanings(translation) {
  if (!translation) return [];
  const parts = translation.split('/').map((s) => s.trim()).filter(Boolean);
  const meanings = [];
  for (const part of parts) {
    const m = part.match(POS_RE);
    if (m) {
      const pos = m[1];
      const defs = m[2].split(/[,，;；]/).map((d) => d.trim()).filter(Boolean);
      meanings.push({ pos, defs });
    } else {
      // 无词性前缀，归到通用
      const defs = part.split(/[,，;；]/).map((d) => d.trim()).filter(Boolean);
      if (defs.length) meanings.push({ pos: '', defs });
    }
  }
  return meanings.length ? meanings : [{ pos: '', defs: [translation.trim()] }];
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error('找不到 ECDICT CSV：', csvPath);
    console.error('请先下载 stardict.csv 放到该路径（见脚本顶部说明）。');
    process.exit(1);
  }
  if (!fs.existsSync(listPath)) {
    console.error('找不到考试词表：', listPath);
    process.exit(1);
  }

  // 1. 建词典 Map
  console.log('解析 ECDICT CSV …');
  const dict = new Map();
  const rl = readline.createInterface({ input: fs.createReadStream(csvPath), crlfDelay: Infinity });
  let total = 0;
  for await (const line of rl) {
    const cols = parseCsvLine(line);
    if (cols.length < 4) continue;
    const [word, phonetic, , translation, pos] = cols;
    if (!word) continue;
    const key = word.toLowerCase();
    if (!dict.has(key)) dict.set(key, { word, phonetic: phonetic || '', translation: translation || '', pos: pos || '' });
    total++;
    if (total % 50000 === 0) console.log('  已读', total);
  }
  console.log('词典条目：', dict.size);

  // 2. 按考试词表取词
  const words = fs.readFileSync(listPath, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  console.log('考试词表：', words.length, '词');

  const entries = [];
  let hit = 0;
  for (const w of words) {
    const e = dict.get(w.toLowerCase());
    if (!e) { console.warn('  词表中有但词典缺失：', w); continue; }
    hit++;
    entries.push({
      spelling: e.word,
      phonetic: e.phonetic || undefined,
      meanings: parseMeanings(e.translation || e.pos),
      examples: [],
    });
  }
  console.log('命中并生成：', hit, '词');

  // 3. 写出 TS 模块
  const body = entries
    .map((e) => {
      const meanings = JSON.stringify(e.meanings);
      const phonetic = e.phonetic ? `phonetic: ${JSON.stringify(e.phonetic)},\n    ` : '';
      return `  {\n    spelling: ${JSON.stringify(e.spelling)},\n    ${phonetic}meanings: ${meanings},\n    examples: [],\n  },`;
    })
    .join('\n');

  const ts = `import type { WordEntry, WordListMeta } from '../types';

// 由 scripts/build-wordlist.js 从全量 ECDICT 自动生成（examples 为空，待补充）。
export const WORDS: WordEntry[] = [
${body}
];

export const META: WordListMeta = {
  id: ${JSON.stringify(bookId)},
  name: ${JSON.stringify(bookName)},
  count: WORDS.length,
};
`;
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log('已写出：', outPath, '(', entries.length, '词 )');
  console.log('提示：在 src/api.ts 里把 BOOKS 的对应词书换成本文件导出的 WORDS / META 即可生效。');
}

main().catch((err) => { console.error(err); process.exit(1); });
