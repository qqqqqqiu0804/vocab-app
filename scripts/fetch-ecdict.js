/**
 * 下载 ECDICT 全量词典到 .cache/（供 scripts/build-dicts.js 使用）。
 *
 * 为什么走 npm 源而不是 GitHub：
 *   - ECDICT 仓库里的 ecdict.csv 有 63MB，jsdelivr 超 20MB 会截断（只回前几十行）；
 *   - raw.githubusercontent / ghproxy 系镜像在国内网络下 20 秒拉不动 2MB；
 *   - npmmirror 上的 ecdict@0.0.4 内含同一份 assets/ecdict.csv，22MB 压缩包，几十秒可下完。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARBALL = 'https://registry.npmmirror.com/ecdict/-/ecdict-0.0.4.tgz';
const CACHE = path.join(__dirname, '..', '.cache');
const TGZ = path.join(CACHE, 'ecdict.tgz');
const CSV = path.join(CACHE, 'package', 'assets', 'ecdict.csv');

async function main() {
  if (fs.existsSync(CSV)) {
    console.log(`已存在，跳过下载：${CSV}`);
    return;
  }
  fs.mkdirSync(CACHE, { recursive: true });

  console.log('下载 ECDICT（约 22MB，来自 npmmirror）…');
  const t0 = Date.now();
  const res = await fetch(TARBALL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(TGZ, buf);
  console.log(
    `  ✓ ${(buf.length / 1024 / 1024).toFixed(2)}MB，耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`
  );

  console.log('解压…');
  execSync(`tar -xzf "${TGZ}" -C "${CACHE}"`, { stdio: 'inherit' });
  if (!fs.existsSync(CSV)) throw new Error('解压后未找到 assets/ecdict.csv');
  console.log(`  ✓ ${CSV}（${(fs.statSync(CSV).size / 1024 / 1024).toFixed(1)}MB）`);
  console.log('\n接下来运行：node scripts/build-dicts.js');
}

main().catch((e) => {
  console.error('✗ 失败：', e.message);
  process.exit(1);
});
