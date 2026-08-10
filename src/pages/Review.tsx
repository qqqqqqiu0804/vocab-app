import { useMemo } from 'react';
import { useStore, dateKey, fmtDuration } from '../store';
import { isDue } from '../scheduler/sm2';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

// 掌握度三档配色（与学习页反馈闪烁一致）
const C_MASTER = '#5ad1c0';
const C_LEARN = '#ffc46b';
const C_NEW = '#ff7a7a';

export function Review() {
  const progress = useStore((s) => s.progress);
  const daily = useStore((s) => s.daily);
  const setView = useStore((s) => s.setView);

  const entries = Object.entries(progress);
  const due = entries.filter(([, s]) => isDue(s));

  const todayKey = dateKey();
  const today = daily[todayKey] ?? { learned: 0, durationSec: 0 };
  const totalLearned = Object.values(daily).reduce((a, d) => a + d.learned, 0);
  const totalDuration = Object.values(daily).reduce((a, d) => a + d.durationSec, 0);

  // 最近 7 天签到日历
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const stat = daily[key];
    days.push({
      key,
      label: WEEK[d.getDay()],
      date: d.getDate(),
      studied: Boolean(stat && stat.learned > 0),
      learned: stat?.learned ?? 0,
    });
  }
  const streak = days.filter((x) => x.studied).length;

  // ===== 掌握度分布：按 SM-2 的 repetitions 分三档 =====
  const dist = useMemo(() => {
    let mastered = 0, learning = 0, fresh = 0;
    for (const [, s] of entries) {
      if (s.repetitions >= 3) mastered++;
      else if (s.repetitions >= 1) learning++;
      else fresh++;
    }
    return { mastered, learning, fresh, total: entries.length };
  }, [entries]);

  // ===== 记忆留存曲线：未来 30 天平均留存率 =====
  // 单词留存模型：R(t) = 0.9 ^ (t / interval)，即每过一个 interval 衰减到 90%
  const curve = useMemo(() => {
    const DAYS = 30;
    const out: number[] = [];
    if (entries.length === 0) return out;
    for (let d = 0; d <= DAYS; d++) {
      let sum = 0;
      for (const [, s] of entries) {
        const r = s.repetitions > 0 && s.interval > 0 ? Math.pow(0.9, d / s.interval) : 0;
        sum += r;
      }
      out.push(sum / entries.length);
    }
    return out;
  }, [entries]);

  const metrics = [
    { label: '今日学习', value: String(today.learned), unit: '词' },
    { label: '累计学习', value: String(totalLearned), unit: '词' },
    { label: '今日时长', value: fmtDuration(today.durationSec), unit: '' },
    { label: '累计时长', value: fmtDuration(totalDuration), unit: '' },
  ];

  return (
    <div className="stats-page">
      <h2 className="stats-title">学习统计</h2>

      <div className="metric-grid">
        {metrics.map((m) => (
          <div className="metric-card" key={m.label}>
            <div className="metric-value">{m.value}<small>{m.unit}</small></div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="calendar-card">
        <div className="calendar-head">
          <span>连续学习</span>
          <b>{streak} 天</b>
        </div>
        <div className="calendar">
          {days.map((d) => (
            <div className={`cal-day ${d.studied ? 'on' : ''}`} key={d.key} title={`${d.key} 学习 ${d.learned} 词`}>
              <div className="cal-label">{d.label}</div>
              <div className="cal-dot">{d.studied ? '✓' : d.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 掌握度分布（环形图） ===== */}
      <div className="chart-card">
        <div className="chart-head">掌握度分布</div>
        {dist.total === 0 ? (
          <p className="center-empty" style={{ margin: '18px 0' }}>还没有学习记录，去学几个词吧。</p>
        ) : (
          <div className="donut-wrap">
            <Donut dist={dist} />
            <ul className="legend">
              <li><i style={{ background: C_MASTER }} />已掌握 {dist.mastered}</li>
              <li><i style={{ background: C_LEARN }} />巩固中 {dist.learning}</li>
              <li><i style={{ background: C_NEW }} />待巩固 {dist.fresh}</li>
            </ul>
          </div>
        )}
      </div>

      {/* ===== 记忆留存曲线（折线图） ===== */}
      <div className="chart-card">
        <div className="chart-head">记忆留存曲线 · 未来 30 天</div>
        {curve.length === 0 ? (
          <p className="center-empty" style={{ margin: '18px 0' }}>先去学几个词，这里会出现你的记忆留存走势。</p>
        ) : (
          <RetentionCurve curve={curve} />
        )}
      </div>

      <div className="card" style={{ textAlign: 'left', marginTop: 18 }}>
        <p style={{ marginTop: 0 }}>已学习单词：<b>{entries.length}</b> 个 · 当前待复习：<b>{due.length}</b> 个</p>
        <p className="center-empty" style={{ marginTop: 6, marginBottom: 0 }}>
          复习按 SM-2 遗忘曲线自动调度，越难的词复习越频繁。
        </p>
      </div>

      <div className="actions">
        <button className="btn-known" disabled={due.length === 0} onClick={() => useStore.getState().startReview()}>
          开始复习
        </button>
        <button className="btn-ghost" onClick={() => setView('home')}>
          返回首页
        </button>
      </div>
    </div>
  );
}

function Donut({ dist }: { dist: { mastered: number; learning: number; fresh: number; total: number } }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const segs = [
    { v: dist.mastered, color: C_MASTER },
    { v: dist.learning, color: C_LEARN },
    { v: dist.fresh, color: C_NEW },
  ];
  let acc = 0;
  return (
    <svg className="donut" viewBox="0 0 160 160" width="160" height="160">
      <g transform="rotate(-90 80 80)">
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="16" />
        {segs.map((s, i) => {
          if (s.v === 0) return null;
          const frac = s.v / dist.total;
          const dash = frac * C;
          const el = (
            <circle
              key={i}
              cx="80" cy="80" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
            />
          );
          acc += dash;
          return el;
        })}
      </g>
      <text x="80" y="74" textAnchor="middle" className="donut-num">{dist.total}</text>
      <text x="80" y="94" textAnchor="middle" className="donut-sub">词</text>
    </svg>
  );
}

function RetentionCurve({ curve }: { curve: number[] }) {
  const W = 640, H = 220;
  const padL = 38, padR = 14, padT = 14, padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const DAYS = curve.length - 1;
  const x = (d: number) => padL + (d / DAYS) * plotW;
  const y = (r: number) => padT + (1 - r) * plotH;

  const line = curve.map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(r).toFixed(1)}`).join(' ');
  const targetY = y(0.9);

  // 刻度线（0/50/90%）
  const ticks = [0, 0.5, 0.9];
  const xLabels = [0, 10, 20, 30];

  return (
    <svg className="curve" viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
      {/* 网格 + Y 轴刻度 */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end" className="axis">{Math.round(t * 100)}%</text>
        </g>
      ))}
      {/* 90% 目标参考线 */}
      <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke={C_MASTER} strokeWidth="1" strokeDasharray="4 4" opacity=".6" />
      {/* 曲线 */}
      <path d={line} fill="none" stroke="#8b7bff" strokeWidth="2.5" strokeLinejoin="round" />
      {/* X 轴标签 */}
      {xLabels.map((d) => (
        <text key={d} x={x(d)} y={H - 8} textAnchor="middle" className="axis">{d}天</text>
      ))}
    </svg>
  );
}
