import type { WordEntry } from '../types';
import { AudioButton } from './AudioButton';
import { ExampleSentence } from './ExampleSentence';

interface Props {
  word: WordEntry;
  /** 是否已看答案（决定是否显示释义与例句） */
  revealed: boolean;
  voice: string;
  /** 例句是否显示中文翻译 */
  showCn: boolean;
}

export function WordCard({ word, revealed, voice, showCn }: Props) {
  return (
    <div className="learn-stage">
      <div className="word-block">
        <span className="spelling">{word.spelling}</span>
        <AudioButton text={word.spelling} voice={voice} />
      </div>
      {word.phonetic && <div className="phonetic">{word.phonetic}</div>}

      {!revealed && (
        <div className="guess-hint">在不看释义的情况下，你能想起它的意思吗？</div>
      )}

      {revealed && (
        <div className="reveal">
          <div className="meanings">
            {word.meanings.map((m, i) => (
              <div className="pos-card" key={i}>
                <span className="pos-tag">{m.pos}</span>
                <span className="pos-defs">{m.defs.join('；')}</span>
              </div>
            ))}
          </div>

          {word.examples.length > 0 && (
            <div className="examples">
              {word.examples.map((ex, i) => (
                <ExampleSentence key={i} ex={ex} voice={voice} showCn={showCn} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
