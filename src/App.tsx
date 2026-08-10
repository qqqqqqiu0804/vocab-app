import { useEffect } from 'react';
import { useStore } from './store';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Review } from './pages/Review';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';

export function App() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const settings = useStore((s) => s.settings);
  const favorites = useStore((s) => s.favorites);

  // 应用主题 + 强调色皮肤：写到 <html> 的 data-* 上，由 CSS 变量驱动
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = settings.theme;
    el.dataset.accent = settings.accent;
  }, [settings.theme, settings.accent]);

  const navItems: { key: typeof view; label: string; badge?: number }[] = [
    { key: 'home', label: '首页' },
    { key: 'favorites', label: '收藏', badge: favorites.length || undefined },
    { key: 'review', label: '统计' },
    { key: 'settings', label: '设置' },
  ];

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand" onClick={() => setView('home')}>
          不背单词<small>复刻版</small>
        </div>
        <nav className="nav">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`nav-item ${view === n.key ? 'active' : ''}`}
              onClick={() => setView(n.key)}
            >
              {n.label}
              {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
            </button>
          ))}
        </nav>
      </div>

      {view === 'home' && <Home />}
      {view === 'learn' && <Learn />}
      {view === 'review' && <Review />}
      {view === 'favorites' && <Favorites />}
      {view === 'settings' && <Settings />}
    </div>
  );
}
