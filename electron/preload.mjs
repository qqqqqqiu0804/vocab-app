import { contextBridge, ipcRenderer } from 'electron';

// 只暴露最小、安全的接口给渲染层
contextBridge.exposeInMainWorld('electronAPI', {
  getAudio: (text, voice) => ipcRenderer.invoke('tts:get', text, voice),
  searchTatoeba: (word) => ipcRenderer.invoke('tatoeba:search', word),
});
