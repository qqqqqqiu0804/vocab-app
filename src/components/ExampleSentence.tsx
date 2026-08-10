import { useState } from 'react';
import type { Example } from '../types';
import { AudioButton } from './AudioButton';
import { playAudio } from '../audio';

interface Props {
  ex: Example;
  voice?: string;
  /** 是否显示中文翻译 */
  showCn?: boolean;
}

export function ExampleSentence({ ex, voice, showCn = true }: Props) {
  const [busy, setBusy] = useState(false);

  // 整张例句卡片可点击朗读（按钮本身会 stopPropagation，不会重复播放）
  const play = async () => {
    setBusy(true);
    try {
      await playAudio(ex.sentence, voice);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={'example' + (busy ? ' playing' : '')} onClick={play}>
      <AudioButton text={ex.sentence} voice={voice} />
      <div className="body">
        <div className="en">{ex.sentence}</div>
        {showCn && <div className="cn">{ex.translation}</div>}
        {ex.source && <span className="ex-source">📚 {ex.source}</span>}
      </div>
    </div>
  );
}
