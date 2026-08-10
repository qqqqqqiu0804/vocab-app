/**
 * 从 ECDICT 的 stardict.csv 导入为本地 SQLite 词典。
 *
 * 步骤：
 *   1. 下载 ECDICT：https://github.com/skywind3000/ECDICT
 *      取仓库里的 stardict.csv（或 ecdict.csv），约 37MB
 *   2. npm i better-sqlite3   （本脚本用 SQLite；MVP 默认走 JSON，可忽略）
 *   3. node scripts/import-ecdict.js <path/to/stardict.csv>
 *
 * 字段（CSV 列）：word, phonetic, definition, translation, pos, collins,
 *                 oxford, tag, bnc, frq, exchange
 *
 * 注意：ECDICT 的 translation 是整段中文释义（含换行），例句需另行接入语料库。
 */
import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('用法: node scripts/import-ecdict.js <stardict.csv>');
  process.exit(1);
}

const dbPath = path.join(__dirname, '../data/dict.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    word TEXT PRIMARY KEY,
    phonetic TEXT,
    pos TEXT,
    translation TEXT
  );
`);

const insert = db.prepare(
  'INSERT OR REPLACE INTO words (word, phonetic, pos, translation) VALUES (?, ?, ?, ?)'
);
const tx = db.transaction(() => {}); // 占位，逐行插入

const rl = readline.createInterface({ input: fs.createReadStream(csvPath) });
let count = 0;
const run = db.transaction((word, phonetic, pos, translation) => {
  insert.run(word, phonetic, pos, translation);
});

rl.on('line', (line) => {
  // CSV 用制表符或逗号分隔，ECDICT 实际为逗号但字段内有逗号，
  // 这里用简单的引号感知解析。
  const cols = parseCsvLine(line);
  if (cols.length < 4) return;
  const [word, phonetic, , translation, pos] = cols;
  run(word, phonetic, pos, translation);
  count++;
  if (count % 50000 === 0) console.log('已导入', count);
});

rl.on('close', () => {
  db.close();
  console.log('导入完成，共', count, '条 ->', dbPath);
});

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
