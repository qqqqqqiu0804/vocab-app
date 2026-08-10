// 一键部署辅助：把 vite 构建产物 dist/ 同步到 docs/（GitHub Pages 源），并写入 .nojekyll
import fs from 'node:fs';

fs.rmSync('docs', { recursive: true, force: true });
fs.cpSync('dist', 'docs', { recursive: true });
fs.writeFileSync('docs/.nojekyll', '');
console.log('docs/ 已更新（来自 dist/，含 .nojekyll）');
