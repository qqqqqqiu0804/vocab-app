import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 渲染层用 Vite 构建；base 用相对路径，方便 Electron 以 file:// 加载打包后的 dist
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // 网页版（dev:web）通过此代理拉取 Tatoeba 例句，规避浏览器 CORS；
    // 桌面版则走主进程 IPC 代理，二者互不冲突。
    proxy: {
      '/api/tatoeba': {
        target: 'https://tatoeba.org/en/api_v0',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/tatoeba/, ''),
      },
    },
  },
});
