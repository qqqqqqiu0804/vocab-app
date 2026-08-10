import { useState, type MouseEvent } from 'react';
import { playAudio } from '../audio';

interface Props {
  text: string;
  voice?: string;
}

/**
 * 发音按钮。点击播放单词/例句的发音。
 * 真正的播放逻辑在 src/audio.ts，优先 Edge TTS，回退浏览器语音。
 */
export function AudioButton({ text, voice }: Props) {
  const [busy, setBusy] = useState(false);

  const play = async (e?: MouseEvent) => {
    // 阻止冒泡：例句卡片整体可点击时，避免按钮与卡片各播一次
    e?.stopPropagation();
    setBusy(true);
    try {
      await playAudio(text, voice);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="audio-btn" onClick={play} disabled={busy} title="播放发音">
      🔊
    </button>
  );
}
