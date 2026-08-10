import { useStore, dateKey } from '../store';
import type { Theme, Accent } from '../store';

const VOICES = [
  { id: 'en-US-AriaNeural', label: '美音 · Aria（女）' },
  { id: 'en-US-GuyNeural', label: '美音 · Guy（男）' },
  { id: 'en-GB-RyanNeural', label: '英音 · Ryan（男）' },
  { id: 'en-GB-SoniaNeural', label: '英音 · Sonia（女）' },
];

const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: '深色' },
  { id: 'light', label: '浅色' },
];

const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'purple', label: '星云紫', color: '#8b7bff' },
  { id: 'teal', label: '薄荷青', color: '#5ad1c0' },
  { id: 'rose', label: '樱花粉', color: '#ff7ab0' },
];

const GOALS = [10, 20, 30, 50];

export function Settings() {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const daily = useStore((s) => s.daily);

  const today = daily[dateKey()];
  const learnedToday = today?.learned ?? 0;
  const goal = settings.dailyGoal;
  const pct = Math.min(100, Math.round((learnedToday / goal) * 100));
  const reached = learnedToday >= goal;

  return (
    <div className="settings-page">
      <h2 className="stats-title">设置</h2>

      {/* 发音人 */}
      <section className="set-card">
        <h3>发音人</h3>
        <p className="muted">决定点读与评分反馈时播放的语音。</p>
        <div className="seg">
          {VOICES.map((v) => (
            <button
              key={v.id}
              className={`seg-item ${settings.voice === v.id ? 'active' : ''}`}
              onClick={() => setSetting('voice', v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* 主题 */}
      <section className="set-card">
        <h3>主题</h3>
        <p className="muted">深色护眼，浅色明亮，随时切换。</p>
        <div className="seg">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`seg-item ${settings.theme === t.id ? 'active' : ''}`}
              onClick={() => setSetting('theme', t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* 强调色皮肤 */}
      <section className="set-card">
        <h3>皮肤</h3>
        <p className="muted">主色调，影响按钮与高亮。</p>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              className={`swatch ${settings.accent === a.id ? 'active' : ''}`}
              style={{ background: a.color }}
              title={a.label}
              onClick={() => setSetting('accent', a.id)}
            >
              {settings.accent === a.id ? '✓' : ''}
            </button>
          ))}
        </div>
      </section>

      {/* 每日目标 */}
      <section className="set-card">
        <h3>每日学习目标</h3>
        <p className="muted">设定后首页会显示今日进度。</p>
        <div className="seg">
          {GOALS.map((g) => (
            <button
              key={g}
              className={`seg-item ${settings.dailyGoal === g ? 'active' : ''}`}
              onClick={() => setSetting('dailyGoal', g)}
            >
              {g} 词
            </button>
          ))}
        </div>
      </section>

      {/* 今日进度 */}
      <section className="set-card">
        <h3>今日进度</h3>
        <div className="goal-row">
          <span>{learnedToday} / {goal} 词</span>
          <span className={reached ? 'goal-ok' : 'muted'}>
            {reached ? '🎉 今日目标已达成！' : `还差 ${goal - learnedToday} 词`}
          </span>
        </div>
        <div className="goal-bar">
          <div className="goal-fill" style={{ width: `${pct}%` }} />
        </div>
      </section>
    </div>
  );
}
