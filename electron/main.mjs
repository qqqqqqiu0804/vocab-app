import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAudio } from './tts.mjs';
import { searchTatoeba } from './tatoeba.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.DEV === '1' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 920,
    height: 680,
    backgroundColor: '#0f1220',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true, // 必须开启，防止渲染层直接访问 Node
      nodeIntegration: false,
      sandbox: false, // 允许 preload 使用 ESM import（默认 sandbox 模式只支持 CommonJS）
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // 发音：主进程调用 Edge TTS（Python），返回 base64 音频，避免渲染层接触文件系统和子进程
  ipcMain.handle('tts:get', async (_e, text, voice) => {
    try {
      return await getAudio(text, voice);
    } catch (err) {
      console.error('[tts]', err);
      return null; // 返回 null 时渲染层会自动回退到 Web Speech API
    }
  });

  // 在线真实例句：主进程代理 Tatoeba，规避浏览器 CORS
  ipcMain.handle('tatoeba:search', async (_e, word) => {
    try {
      return await searchTatoeba(word);
    } catch (err) {
      console.error('[tatoeba]', err);
      return [];
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
