import { useEffect, useState } from 'react';
import { useStore, dateKey } from '../store';
import { api } from '../api';
import { isDue } from '../scheduler/sm2';
import { playAudio } from '../audio';
import type { WordEntry } from '../types';

/** 精选词书（带真实出处例句）单独成组，和标准考纲词书区分开 */
const CLASSIC_PREFIX = 'classic-';

export function Home() {
  const lists = useStore((s) => s.lists);
  const loadLists = useStore((s) => s.loadLists);
  const startList = useStore((s) => s.startList);
  const startReview = useStore((s) => s.startReview);
  const startLookup = useStore((s) => s.startLookup);
  const progress = useStore((s) => s.progress);
  const daily = useStore((s) => s.daily);
  const setView = useStore((s) => s.setView);
  const voice = useStore((s) => s.settings.voice);
  const dailyGoal = useStore((s) => s.settings.dailyGoal);
  const loadingList = useStore((s) => s.loadingList);

  const [q, setQ] = useState('');
  const [results, setResults] = useState<WordEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [descs, setDescs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // 词书副标题（描述）
  useEffect(() => {
    let alive = true;
    Promise.all(
      lists.map(async (l) => [l.id, await api.getListDesc(l.id)] as const)
    ).then((pairs) => {
      if (alive) setDescs(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
  }, [lists]);

  // 搜索：全局索引是懒加载的，这里做防抖 + 竞态保护
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let alive = true;
    const timer = setTimeout(() => {
      api.searchWords(term).then((r) => {
        if (!alive) return;
        setResults(r);
        setSearching(false);
      });
    }, 180);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [q]);

  const dueCount = Object.values(progress).filter((s) => isDue(s)).length;

  const today = daily[dateKey()];
  const learnedToday = today?.learned ?? 0;
  const pct = Math.min(100, Math.round((learnedToday / dailyGoal) * 100));
  const reached = learnedToday >= dailyGoal;

  const classics = lists.filter((l) => l.id.startsWith(CLASSIC_PREFIX));
  const standards = lists.filter((l) => !l.id.startsWith(CLASSIC_PREFIX));
  const totalWords = standards.reduce((n, l) => n + l.count, 0);

  const renderCards = (items: typeof lists) => (
    <div className="list-grid">
      {items.map((l) => (
        <div key={l.id} className="list-card" onClick={() => startList(l.id)}>
          <h3>{l.name}</h3>
          <p>
            共 {l.count.toLocaleString()} 词
            {descs[l.id] ? ` · ${descs[l.id]}` : ''}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* 搜索框 */}
      <div className="search-bar">
        <span className="search-ico">🔍</span>
        <input
          className="search-input"
          placeholder="查词 / 搜词书：输入拼写，如 aban、com"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="search-clear" title="清空" onClick={() => setQ('')}>✕</button>
        )}
      </div>

      {q.trim() ? (
        <div className="search-result">
          <div className="result-head">
            <span>
              {searching ? '搜索中…' : `“${q.trim()}” 找到 ${results.length} 个词`}
            </span>
            <button
              className="btn-known"
              disabled={results.length === 0}
              onClick={() => startLookup(results, q.trim())}
            >
              开始学习这 {results.length} 个词
            </button>
          </div>
          {!searching && results.length === 0 ? (
            <p className="center-empty" style={{ marginTop: 30 }}>没有匹配的词，换个拼写试试。</p>
          ) : (
            <div className="result-list">
              {results.map((w) => (
                <div
                  className="result-item"
                  key={w.spelling}
                  onClick={() => startLookup(results, q.trim())}
                >
                  <button
                    className="result-speak"
                    title="朗读"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(w.spelling, voice);
                    }}
                  >
                    🔊
                  </button>
                  <div className="result-text">
                    <div className="result-spelling">{w.spelling}</div>
                    <div className="result-mean">
                      {w.meanings.map((m) => `${m.pos} ${m.defs.join('；')}`).join('；')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="hero">
            <h1>在语境里记单词</h1>
            <p>
              {totalWords > 0
                ? `已收录 ${totalWords.toLocaleString()} 词，挑一本开始今天的记忆之旅。`
                : '挑选一个词单，开始今天的记忆之旅。'}
            </p>
          </div>

          {/* 每日目标进度 */}
          <div className="goal-card">
            <div className="goal-row">
              <span>今日已学 <b>{learnedToday}</b> / {dailyGoal} 词</span>
              <span className={reached ? 'goal-ok' : 'muted'}>
                {reached ? '🎉 目标已达成！' : `还差 ${dailyGoal - learnedToday} 词`}
              </span>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {loadingList && <p className="center-empty">词书加载中…</p>}

          {classics.length > 0 && (
            <>
              <div className="section-head">
                <h2>精选词书</h2>
                <span className="muted">人工打磨释义，配带出处的真实例句</span>
              </div>
              {renderCards(classics)}
            </>
          )}

          {standards.length > 0 && (
            <>
              <div className="section-head">
                <h2>考纲词书</h2>
                <span className="muted">按词频排序，常用词优先；例句由 Tatoeba 真实语料补齐</span>
              </div>
              {renderCards(standards)}
            </>
          )}

          {lists.length === 0 && <p className="center-empty">加载词书中…</p>}

          <div className="actions" style={{ marginTop: 22 }}>
            <button
              className="btn-ghost"
              disabled={dueCount === 0}
              onClick={startReview}
            >
              复习待办（{dueCount}）
            </button>
            <button className="btn-ghost" onClick={() => setView('review')}>
              学习统计
            </button>
          </div>
        </>
      )}
    </div>
  );
}
