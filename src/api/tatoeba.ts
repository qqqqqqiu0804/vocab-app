import type { Example } from '../types';
import { getOfflineExamples } from './tatoeba-offline';

/**
 * 拉取单词的真实双语例句（Tatoeba）。
 * 优先级（离线优先，在线兜底）：
 *   1. 本地离线包（public/tatoeba-offline.json，由脚本预生成）
 *   2. 桌面版 → 主进程 IPC 代理（无 CORS 限制）
 *   3. 网页版 dev → Vite 代理 /api/tatoeba（本地开发可用）
 *   4. 都不可用 → 返回空数组（页面优雅降级，不报错）
 */
export async function fetchTatoebaExamples(word: string, limit = 3): Promise<Example[]> {
  // 0) 离线包优先：本地已抓好的例句，秒出且无需联网
  try {
    const offline = await getOfflineExamples(word, limit);
    if (offline && offline.length) return offline;
  } catch {
    /* 走下一步 */
  }

  // 1) 桌面版：主进程代理
  const api = (window as any).electronAPI;
  if (api?.searchTatoeba) {
    try {
      const res = await api.searchTatoeba(word);
      if (Array.isArray(res) && res.length) return res.slice(0, limit);
    } catch {
      /* 走下一步 */
    }
  }

  // 2) 网页版：dev 代理
  try {
    const r = await fetch(
      `/api/tatoeba/search?query=${encodeURIComponent(word)}&from=eng&to=cmn&orphans=no`
    );
    if (r.ok) {
      const data = await r.json();
      const list = (data.results || [])
        .filter(
          (x: any) =>
            x &&
            x.text &&
            Array.isArray(x.translations) &&
            x.translations.length &&
            Array.isArray(x.translations[0]) &&
            x.translations[0].length
        )
        .slice(0, limit)
        .map((x: any) => ({
          sentence: x.text,
          translation: x.translations[0][0].text || '',
          source: 'Tatoeba',
        }));
      if (list.length) return list;
    }
  } catch {
    /* 忽略，返回空 */
  }

  return [];
}
