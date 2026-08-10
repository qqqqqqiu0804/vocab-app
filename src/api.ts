import type { WordListMeta, WordEntry } from './types';
import { CET6, CET6_META } from './data/cet6';
import { KAOYAN, KAOYAN_META } from './data/kaoyan';

/**
 * 渲染层的数据访问层。
 *
 * 两类词书：
 *   1) 精选词书（内置，src/data/*.ts）——人工打磨的释义 + 带出处的真实语境例句，随包发布、零延迟。
 *   2) 标准词书（懒加载，public/dicts/*.json）——由 ECDICT 全量词典切出的中考/高考/四六级/考研/雅思/托福/GRE，
 *      共 1.4 万+ 词。体积大，所以按需 fetch 并在内存缓存，例句由 Tatoeba 在线/离线补齐。
 *
 * 生成词书：node scripts/fetch-ecdict.js && node scripts/build-dicts.js
 */

/** public/dicts/*.json 里的紧凑词条格式（缩短 key 以压体积） */
interface RawEntry {
  w: string;
  p?: string;
  m: [string, string[]][];
  /** 柯林斯星级 1-5 */
  c?: number;
  /** 是否牛津核心词 */
  o?: number;
}

interface BookMeta {
  id: string;
  name: string;
  desc: string;
  count: number;
}

const BASE = import.meta.env.BASE_URL || '/';

/** 内置精选词书：有真实出处例句，是「在语境里记单词」的样板 */
const BUILTIN: Record<string, { meta: WordListMeta; desc: string; words: WordEntry[] }> = {
  cet6: { meta: CET6_META, desc: '人工打磨释义 + 带出处真实例句', words: CET6 },
  kaoyan: { meta: KAOYAN_META, desc: '人工打磨释义 + 带出处真实例句', words: KAOYAN },
};

function expand(r: RawEntry): WordEntry {
  return {
    spelling: r.w,
    phonetic: r.p || undefined,
    meanings: r.m.map(([pos, defs]) => ({ pos, defs })),
    examples: [],
  };
}

async function getJSON<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE}dicts/${file}`);
  if (!res.ok) throw new Error(`加载 ${file} 失败：HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* ---------------- 缓存：词书目录 / 单本词书 / 全局索引 ---------------- */

let manifestPromise: Promise<BookMeta[]> | null = null;
const bookCache = new Map<string, Promise<WordEntry[]>>();
let indexPromise: Promise<{ list: WordEntry[]; map: Map<string, WordEntry> }> | null = null;

function loadManifest(): Promise<BookMeta[]> {
  // 词书目录缺失时不阻塞整个应用，退化为「只有精选词书」
  manifestPromise ??= getJSON<BookMeta[]>('manifest.json').catch(() => []);
  return manifestPromise;
}

function loadBook(id: string): Promise<WordEntry[]> {
  let p = bookCache.get(id);
  if (!p) {
    p = getJSON<RawEntry[]>(`${id}.json`)
      .then((raw) => raw.map(expand))
      .catch(() => []);
    bookCache.set(id, p);
  }
  return p;
}

/** 全局索引：全部 1.4 万词的精简条目，供跨词书搜索与收藏还原 */
function loadIndex() {
  indexPromise ??= getJSON<RawEntry[]>('index.json')
    .then((raw) => {
      const list = raw.map(expand);
      const map = new Map<string, WordEntry>();
      // 精选词书优先（它们带真实例句），再补索引里的词
      for (const b of Object.values(BUILTIN)) {
        for (const w of b.words) map.set(w.spelling, w);
      }
      for (const w of list) if (!map.has(w.spelling)) map.set(w.spelling, w);
      return { list: [...map.values()], map };
    })
    .catch(() => {
      // 索引加载失败时退化到内置词书，搜索仍可用
      const map = new Map<string, WordEntry>();
      for (const b of Object.values(BUILTIN)) {
        for (const w of b.words) map.set(w.spelling, w);
      }
      return { list: [...map.values()], map };
    });
  return indexPromise;
}

export const api = {
  getLists: async (): Promise<WordListMeta[]> => {
    const manifest = await loadManifest();
    return [
      ...Object.entries(BUILTIN).map(([id, b]) => ({
        ...b.meta,
        id: `classic-${id}`,
        name: `${b.meta.name} · 精选`,
      })),
      ...manifest.map((m) => ({ id: m.id, name: m.name, count: m.count })),
    ];
  },

  /** 词书描述（首页卡片副标题用） */
  getListDesc: async (id: string): Promise<string> => {
    if (id.startsWith('classic-')) return BUILTIN[id.slice(8)]?.desc ?? '';
    const manifest = await loadManifest();
    return manifest.find((m) => m.id === id)?.desc ?? '';
  },

  getWordList: async (id: string): Promise<WordEntry[]> => {
    if (id.startsWith('classic-')) {
      const b = BUILTIN[id.slice(8)];
      if (b) return b.words;
    }
    const words = await loadBook(id);
    // 未知 id 兜底，保证永不空列表
    return words.length ? words : BUILTIN.cet6.words;
  },

  /** 全部词（去重）：搜索 / 查词 / 收藏定位 */
  allWords: async (): Promise<WordEntry[]> => (await loadIndex()).list,

  /**
   * 跨词书模糊查词。排序策略：完全相等 > 前缀匹配 > 包含匹配，
   * 同级按长度升序，让最像的词排在最前面。
   */
  searchWords: async (query: string, limit = 60): Promise<WordEntry[]> => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const { list } = await loadIndex();
    const scored: { w: WordEntry; rank: number }[] = [];
    for (const w of list) {
      const s = w.spelling.toLowerCase();
      const at = s.indexOf(q);
      if (at < 0) continue;
      const rank = s === q ? 0 : at === 0 ? 1 : 2;
      scored.push({ w, rank });
    }
    scored.sort(
      (a, b) => a.rank - b.rank || a.w.spelling.length - b.w.spelling.length
    );
    return scored.slice(0, limit).map((x) => x.w);
  },

  /** 按拼写定位单词（收藏夹 / 复习还原用） */
  findWord: async (spelling: string): Promise<WordEntry | undefined> =>
    (await loadIndex()).map.get(spelling),

  /** 批量定位，避免收藏/复习逐个 await */
  findWords: async (spellings: string[]): Promise<WordEntry[]> => {
    const { map } = await loadIndex();
    return spellings
      .map((s) => map.get(s))
      .filter((w): w is WordEntry => Boolean(w));
  },
};
