import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { WordCard } from '../components/WordCard';
import { ExampleSentence } from '../components/ExampleSentence';
import { playAudio } from '../audio';
import { fetchTatoebaExamples } from '../api/tatoeba';
import type { Example } from '../types';

type Result = 'known' | 'fuzzy' | 'unknown';

export function Learn() {
  const list = useStore((s) => s.list);
  const idx = useStore((s) => s.idx);
  const listName = useStore((s) => s.listName);
  const session = useStore((s) => s.session);
  const voice = useStore((s) => s.settings.voice);
  const mark = useStore((s) => s.mark);
  const back = useStore((s) => s.back);
  const setView = useStore((s) => s.setView);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const isFavorite = useStore((s) => s.isFavorite);
  const originView = useStore((s) => s.originView);

  const [revealed, setRevealed] = useState(false);
  const [showCn, setShowCn] = useState(true);
  const [result, setResult] = useState<null | Result>(null);
  const [answered, setAnswered] = useState(false);
  // 用 ref 加锁，确保反馈窗口内不会被重复计分（HMR 下也稳）
  const lockingRef = useRef(false);
  // 记录本次评分，点「下一个」时再真正提交给 store
  const gradeRef = useRef<number | null>(null);
  // 揭示答案后自动播语境音频（例句优先，离线包秒出）：用 ref 保证每词只播一次
  const playedRevealRef = useRef(false);

  // 先取当前词（必须放在依赖里用到 word 的 useCallback/useEffect 之前，否则触发 TDZ）
  const word = list[idx];

  // 在线真实例句（Tatoeba）：本地 examples 之外，按需补充真实语境
  const [onlineEx, setOnlineEx] = useState<Example[]>([]);
  const [loadingEx, setLoadingEx] = useState(false);
  useEffect(() => {
    setOnlineEx([]);
    setLoadingEx(false);
  }, [idx]);
  const loadOnlineExamples = useCallback(async () => {
    if (loadingEx) return;
    setLoadingEx(true);
    try {
      const ex = await fetchTatoebaExamples(word.spelling);
      setOnlineEx(ex);
    } finally {
      setLoadingEx(false);
    }
  }, [loadingEx, word]);

  // 大词库词没有内置例句：揭示答案后自动去 Tatoeba 拉真实语境（手动按钮仍保留作兜底）
  useEffect(() => {
    if (revealed && word && word.examples.length === 0 && onlineEx.length === 0 && !loadingEx) {
      loadOnlineExamples();
    }
  }, [revealed, word, onlineEx.length, loadingEx, loadOnlineExamples]);

  // 揭示答案后自动播放语境音频：优先例句（离线包/在线秒出），无例句则播单词；每词仅一次。
  // examples 可能异步到位（大词库词在线拉取），所以等其到达或确认无结果后再播。
  useEffect(() => {
    if (!revealed || !word || playedRevealRef.current) return;
    const exs = word.examples.length ? word.examples : onlineEx;
    if (exs.length > 0) {
      playedRevealRef.current = true;
      playAudio(exs[0].sentence, voice);
    } else if (!loadingEx) {
      // 例句拉取已结束但无结果：至少播单词本身，保证「听得到」
      playedRevealRef.current = true;
      playAudio(word.spelling, voice);
    }
    // 仍在加载中则等待：onlineEx / loadingEx 变化会触发本 effect 重跑
  }, [revealed, word, onlineEx, loadingEx, voice]);

  // 切换单词时重置状态
  useEffect(() => {
    setRevealed(false);
    setAnswered(false);
    setResult(null);
    playedRevealRef.current = false;
  }, [idx]);

  // 进入新单词时自动播放一次单词发音
  useEffect(() => {
    if (word) playAudio(word.spelling, voice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.spelling]);

  // 评分：揭示正确释义；音频由 reveal 后的自动播放 effect 统一处理
  const handleMark = useCallback((grade: number) => {
    if (lockingRef.current || answered || !word) return;
    lockingRef.current = true;
    gradeRef.current = grade;
    const kind: Result = grade >= 4 ? 'known' : grade >= 3 ? 'fuzzy' : 'unknown';
    setAnswered(true);
    setRevealed(true); // 无论认识与否都展示答案
    setResult(kind);
  }, [answered, word]);

  // 用户读完答案后进入下一词
  const goNext = useCallback(() => {
    if (gradeRef.current !== null) {
      mark(gradeRef.current);
      gradeRef.current = null;
    }
    setAnswered(false);
    setResult(null);
    lockingRef.current = false;
  }, [mark]);

  // 键盘操作：未答时 空格看答案 / A·← 不认识 / S·↓ 模糊 / D·→ 认识；
  // 已答时 空格/回车/方向键 都表示「下一个」。
  // （asd 三键即「不认识 / 模糊 / 认识」从左到右，单手即可盲打评分）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered) {
        if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'a', 'A', 's', 'S', 'd', 'D', 'f', 'F', 'k', 'K'].includes(e.key)) {
          e.preventDefault();
          goNext();
        }
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMark(0); // 不认识
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleMark(3); // 模糊
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleMark(5); // 认识
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, revealed, handleMark, goNext]);

  // 所有 hooks 之后再做条件早返回
  if (!word) {
    return <p className="center-empty">没有可学习的单词，去首页选个词单吧。</p>;
  }

  const fav = isFavorite(word.spelling);

  const resultText =
    result === 'known' ? '认识 ✓ 看下释义巩固一下'
    : result === 'fuzzy' ? '模糊？看例句，在语境里把它记住'
    : '不认识？听例句，在语境里建立印象';

  return (
    <div className={'learn' + (result ? ' fb-' + result : '')}>
      {/* 顶部工具栏 */}
      <div className="toolbar">
        <button className="tool" title="返回" onClick={() => setView(originView)}>‹</button>
        <button className="tool" title="撤销" disabled={idx === 0} onClick={back}>↶</button>
        <div className="tool-spacer" />
        <button
          className={`tool ${fav ? 'active' : ''}`}
          title="收藏"
          onClick={() => toggleFavorite(word.spelling)}
        >
          {fav ? '★' : '☆'}
        </button>
        <button
          className={`tool ${!showCn ? 'active' : ''}`}
          title="例句中文翻译开关"
          onClick={() => setShowCn((v) => !v)}
        >
          文
        </button>
        <button className="tool" title="更多">⋯</button>
      </div>

      <div className="progress-line">
        {listName} · 第 {idx + 1} / {list.length} 词 · 本次已学 {session.learned}
      </div>

      <WordCard
        key={word.spelling}
        word={word}
        revealed={revealed}
        voice={voice}
        showCn={showCn}
      />

      {revealed && (
        <div className="more-ex">
          {onlineEx.length === 0 && !loadingEx && (
            <button className="link-btn" onClick={loadOnlineExamples}>
              🔍 加载更多真实例句（Tatoeba）
            </button>
          )}
          {loadingEx && <span className="muted">真实例句加载中…</span>}
          {onlineEx.map((ex, i) => (
            <ExampleSentence key={i} ex={ex} voice={voice} showCn={showCn} />
          ))}
        </div>
      )}

      {answered ? (
        <>
          <div className={'result-line ' + (result === 'known' ? 'ok' : result === 'fuzzy' ? 'mid' : 'wrong')}>
            {resultText}
          </div>
          <div className="judge">
            <button className="next-btn" onClick={goNext}>下一个 ›</button>
          </div>
        </>
      ) : (
        <>
          {/* 底部判断区：认识 / 模糊 / 不认识（不背单词三档） */}
          <div className="judge">
            <button className="judge-btn danger" onClick={() => handleMark(0)}>不认识</button>
            <button className="judge-btn mid" onClick={() => handleMark(3)}>模糊</button>
            <button className="judge-btn ok" onClick={() => handleMark(5)}>认识</button>
          </div>

          <div className="peek-row">
            {!revealed ? (
              <button className="link-btn" onClick={() => setRevealed(true)}>看答案 ›</button>
            ) : (
              <button className="link-btn" onClick={() => setRevealed(false)}>‹ 隐藏释义</button>
            )}
          </div>
        </>
      )}

      <div className="kbd-hint">
        {answered ? (
          <span><b>空格</b>/<b>→</b> 下一个</span>
        ) : (
          <>
            <span><b>空格</b>看答案</span>
            <span><b>A</b>/<b>←</b>不认识</span>
            <span><b>S</b>/<b>↓</b>模糊</span>
            <span><b>D</b>/<b>→</b>认识</span>
          </>
        )}
        <span>🔊点读</span>
      </div>
    </div>
  );
}
