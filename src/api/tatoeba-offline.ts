import type { Example } from '../types';

/**
 * 离线 Tatoeba 例句包加载器。
 * 数据由 scripts/build-tatoeba-offline.js 生成到 public/tatoeba-offline.json，
 * 形如 { [word]: Example[] }。学习时优先命中本地包，弱网/离线也能用真实语境。
 */
let cache: Record<string, Example[]> | null = null;
let loading: Promise<Record<string, Example[]> | null> | null = null;

export async function loadOfflineBundle(): Promise<Record<string, Example[]> | null> {
  if (cache) return cache;
  if (loading) return loading;
  loading = (async () => {
    try {
      const url = `${import.meta.env.BASE_URL}tatoeba-offline.json`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const data = (await r.json()) as Record<string, Example[]>;
      cache = data;
      return data;
    } catch {
      return null;
    }
  })();
  return loading;
}

/** 命中离线包返回例句，未命中返回 null（交给在线兜底） */
export async function getOfflineExamples(word: string, limit = 3): Promise<Example[] | null> {
  const bundle = await loadOfflineBundle();
  if (!bundle) return null;
  const ex = bundle[word];
  if (!ex || ex.length === 0) return null;
  return ex.slice(0, limit);
}
