/**
 * 生成离线 Tatoeba 双语例句包：public/tatoeba-offline.json
 *
 * 覆盖全部 8 本考纲词书（中考/高考/四六级/考研/雅思/托福/GRE）共 1.4 万+ 唯一词，
 * 弱网/离线也能秒出真实语境例句。
 *
 * 关键能力（相比旧版 100 词版）：
 *   - 词源改为 public/dicts/index.json（14925 唯一词），不再只抠 src/data/*.ts。
 *   - 断点续传：已写入的词直接跳过，重新运行从中断处继续。
 *   - 增量落盘：每 100 词写一次盘，进程被杀也不丢已抓取成果。
 *   - 限速友好：并发 4 + 每词 200ms 让位 + 429/超时指数退避重试（最多 5 次）。
 *
 * 用法：node scripts/build-tatoeba-offline.js [--limit N]
 *   --limit N  只抓前 N 个词（调试用，不传则全量）
 * 产物：public/tatoeba-offline.json  ->  { [word]: Example[] }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const INDEX = resolve(ROOT, 'public/dicts/index.json');
const OUT = resolve(ROOT, 'public/tatoeba-offline.json');
const FLUSH_EVERY = 50;

function loadSpellings() {
  const raw = JSON.parse(readFileSync(INDEX, 'utf8'));
  // index.json 是紧凑格式 [{w,p,m,c,o}]
  const words = raw.map((r) => r.w).filter(Boolean);
  return [...new Set(words)];
}

function loadExisting() {
  if (!existsSync(OUT)) return {};
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
}

function toExamples(data, limit = 3) {
  const list = (data.results || [])
    .filter(
      (x) =>
        x &&
        x.text &&
        Array.isArray(x.translations) &&
        x.translations.length &&
        Array.isArray(x.translations[0]) &&
        x.translations[0].length
    )
    .slice(0, limit)
    .map((x) => ({
      sentence: x.text,
      translation: x.translations[0][0].text || '',
      source: 'Tatoeba',
    }));
  return list;
}

async function fetchExamples(word, limit = 3) {
  const url = `https://tatoeba.org/en/api_v0/search?query=${encodeURIComponent(
    word
  )}&from=eng&to=cmn&orphans=no`;
  // 遇到 429/超时自动退避重试，避免被 Tatoeba 限流时整批失败
  for (let attempt = 0; attempt < 5; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const r = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });
      if (r.status === 429) {
        const wait = 1000 * Math.pow(2, attempt);
        console.warn(`  ⏳ ${word} 被限流，等待 ${wait}ms 重试`);
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return toExamples(data, limit);
    } catch (e) {
      if (attempt === 4) throw e;
      await new Promise((res) => setTimeout(res, 800 * Math.pow(2, attempt)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('重试耗尽');
}

async function main() {
  const limit = process.argv.includes('--limit')
    ? Number(process.argv[process.argv.indexOf('--limit') + 1]) || Infinity
    : Infinity;

  const all = loadSpellings();
  const existing = loadExisting();
  const todo = all.filter((w) => !existing[w]);
  const target = todo.slice(0, limit === Infinity ? todo.length : limit);

  console.log(
    `[offline] 词库共 ${all.length} 词，已离线覆盖 ${Object.keys(existing).length} 词，` +
      `本次待抓 ${target.length} 词${limit !== Infinity ? `（限制 ${limit}）` : ''}`
  );
  if (target.length === 0) {
    console.log('[offline] 没有需要新抓的词，离线包已是最新。');
    return;
  }

  const result = existing; // 复用已有结果，增量写入
  const ci = process.argv.indexOf('--concurrency');
  const CONCURRENCY = ci !== -1 ? Number(process.argv[ci + 1]) || 8 : 8;
  const gi = process.argv.indexOf('--gap');
  const GAP_MS = gi !== -1 ? Number(process.argv[gi + 1]) || 400 : 400;
  let done = 0;
  let ok = 0;
  let sinceFlush = 0;

  // 全局令牌桶：每 GAP_MS 才放行一个请求，把总速率压在 Tatoeba 容忍线以下，
  // 避免触发 429 退避重试（重试会白白浪费时间）。并发只用来填满网络延迟。
  let nextStart = Date.now();
  async function acquire() {
    const wait = nextStart - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    nextStart = Date.now() + GAP_MS;
  }

  async function worker(queue) {
    for (const word of queue) {
      try {
        await acquire(); // 限速令牌
        const ex = await fetchExamples(word);
        if (ex.length) {
          result[word] = ex;
          ok++;
        }
      } catch (e) {
        // 单个词失败不影响整体，离线包允许缺漏
        console.warn(`  ✗ ${word}: ${e.message}`);
      } finally {
        done++;
        sinceFlush++;
        if (done % 20 === 0 || done === target.length) {
          console.log(
            `  … ${done}/${target.length} (新增 ${ok} 词例句，累计 ${Object.keys(result).length} 词)`
          );
        }
        // 增量落盘：进程被杀也能保留已抓成果
        if (sinceFlush >= FLUSH_EVERY) {
          writeFileSync(OUT, JSON.stringify(result));
          sinceFlush = 0;
        }
      }
    }
  }

  // 简单分片并发
  const slices = Array.from({ length: CONCURRENCY }, (_, i) =>
    target.filter((_, idx) => idx % CONCURRENCY === i)
  );
  await Promise.all(slices.map((q) => worker(q)));

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result));
  const kb = (JSON.stringify(result).length / 1024).toFixed(1);
  console.log(
    `[offline] 完成！累计 ${Object.keys(result).length}/${all.length} 词写入 ${OUT} (${kb} KB)`
  );
}

main().catch((e) => {
  console.error('生成失败：', e);
  process.exit(1);
});
