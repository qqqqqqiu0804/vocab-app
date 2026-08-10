/**
 * 统一的发音播放函数：优先走主进程 Edge TTS（高质量、可缓存），
 * 失败或离线时回退浏览器内置 Web Speech API，保证始终有声音。
 */
export async function playAudio(text: string, voice?: string): Promise<void> {
  const v = voice ?? 'en-US-AriaNeural';
  try {
    const dataUrl = await window.electronAPI?.getAudio(text, v);
    if (dataUrl) {
      const audio = new Audio(dataUrl);
      await audio.play();
      return;
    }
    throw new Error('no-edge-tts');
  } catch {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = v.includes('en-GB') ? 'en-GB' : 'en-US';
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      /* 忽略：环境不支持语音 */
    }
  }
}
