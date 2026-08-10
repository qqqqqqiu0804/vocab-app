import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { api } from '../api';
import { playAudio } from '../audio';
import type { WordEntry } from '../types';

export function Favorites() {
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const startFavorites = useStore((s) => s.startFavorites);
  const setView = useStore((s) => s.setView);
  const voice = useStore((s) => s.settings.voice);

  // 用收藏的拼写还原出完整词条目（跨词书查全局索引，异步）
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (favorites.length === 0) {
      setWords([]);
      return;
    }
    setLoading(true);
    api.findWords(favorites).then((ws) => {
      if (!alive) return;
      setWords(ws);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [favorites]);

  return (
    <div className="fav-page">
      <div className="page-head">
        <h2 className="stats-title">收藏夹</h2>
        <span className="muted">
          {loading ? '还原中…' : `共 ${words.length} 个收藏词`}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', marginTop: 18 }}>
          <p className="center-empty" style={{ marginTop: 24 }}>
            还没有收藏的词。学习时点右上角 ☆ 即可加入收藏。
          </p>
          <div className="actions">
            <button className="btn-known" onClick={() => setView('home')}>去选词单</button>
          </div>
        </div>
      ) : (
        <>
          <div className="actions" style={{ marginTop: 8 }}>
            <button className="btn-known" disabled={words.length === 0} onClick={startFavorites}>
              开始练习收藏（{words.length}）
            </button>
          </div>

          {loading ? (
            <p className="center-empty" style={{ marginTop: 24 }}>正在从词库还原收藏词…</p>
          ) : (
            <div className="fav-list">
              {words.map((w) => (
                <div className="fav-item" key={w.spelling}>
                  <div className="fav-main">
                    <button
                      className="fav-speak"
                      title="朗读"
                      onClick={() => playAudio(w.spelling, voice)}
                    >
                      🔊
                    </button>
                    <div className="fav-text">
                      <div className="fav-spelling">{w.spelling}</div>
                      <div className="fav-mean">
                        {w.meanings.map((m) => `${m.pos} ${m.defs.join('；')}`).join('；')}
                      </div>
                    </div>
                  </div>
                  <button
                    className="fav-remove"
                    title="取消收藏"
                    onClick={() => toggleFavorite(w.spelling)}
                  >
                    ☆
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
