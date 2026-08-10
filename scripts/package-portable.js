// 生成「绿色版」桌面应用（不依赖 electron-builder 联网下载）：
//  1. 复制 node_modules/electron/dist  → release/            （Electron 运行时）
//  2. 复制 vite 构建产物 dist/         → release/resources/app/dist/
//  3. 复制 electron/*.mjs             → release/resources/app/electron/
//  4. 复制 package.json               → release/resources/app/package.json
// 运行前需先 `npm run build` 生成前端 dist，且 node_modules/electron 二进制已存在。
// 生成后双击 release/electron.exe 即可运行（无需安装）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'release');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

rmrf(outRoot);
// 1) Electron 运行时（含 electron.exe / resources/ 等）
copyDir(path.join(root, 'node_modules/electron/dist'), outRoot);
// 2) 应用本体
const appDir = path.join(outRoot, 'resources/app');
fs.mkdirSync(appDir, { recursive: true });
copyDir(path.join(root, 'dist'), path.join(appDir, 'dist'));
fs.mkdirSync(path.join(appDir, 'electron'), { recursive: true });
for (const f of ['main.mjs', 'preload.mjs', 'tts.mjs', 'tatoeba.mjs']) {
  fs.copyFileSync(path.join(root, 'electron', f), path.join(appDir, 'electron', f));
}
fs.copyFileSync(path.join(root, 'package.json'), path.join(appDir, 'package.json'));
console.log('✓ Portable build written to release/  (双击 release/electron.exe 运行)');
