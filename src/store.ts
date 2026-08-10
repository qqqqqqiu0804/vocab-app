import { create } from 'zustand';
import type { WordEntry, WordListMeta } from './types';
import { initialScheduling, review, isDue, type SchedulingState } from './scheduler/sm2';
import { api } from './api';

export type View = 'home' | 'learn' | 'review' | 'favorites' | 'settings';
export type Theme = 'dark' | 'light';
export type Accent = 'purple' | 'teal' | 'rose';

const PROGRESS_KEY = 'vocab.progress';
const SETTINGS_KEY = 'vocab.settings';
const DAILY_KEY = 'vocab.daily';
const FAV_KEY = 'vocab.favorites';

interface Settings {
  voice: string; // en-US-AriaNeural / en-GB-RyanNeural ...
  theme: Theme; // 深 / 浅
  accent: Accent; // 强调色皮肤
  dailyGoal: number; // 每日学习目标（词）
}

interface Session {
  learned: number;
  known: number;
  unknown: number;
}

/** 每日统计：学习词数 + 学习时长（秒） */
interface DailyStat {
  learned: number;
  durationSec: number;
}

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 0) return `${m}分${r}秒`;
  return `${r}秒`;
}

interface State {
  view: View;
  /** 返回视图：从收藏/搜索/复习会话退出时回到哪里 */
  originView: View;
  lists: WordListMeta[];
  list: WordEntry[];
  listName: string;
  idx: number;
  progress: Record<string, SchedulingState>;
  session: Session;
  settings: Settings;
  daily: Record<string, DailyStat>;
  favorites: string[];
  /** 当前词显示起始时间戳（用于累计学习时长） */
  lastShownAt: number;
  /** 词书加载中（标准词书体积较大，需要 fetch） */
  loadingList: boolean;
  loadLists: () => Promise<void>;
  startList: (id: string) => Promise<void>;
  startReview: () => Promise<void>;
  startFavorites: () => Promise<void>;
  startLookup: (words: WordEntry[], query: string) => void;
  mark: (quality: number) => void;
  back: () => void;
  toggleFavorite: (spelling: string) => void;
  isFavorite: (spelling: string) => boolean;
  setView: (v: View) => void;
  setVoice: (v: string) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const useStore = create<State>((set, get) => ({
  view: 'home',
  originView: 'home',
  lists: [],
  list: [],
  listName: '',
  idx: 0,
  progress: loadJSON<Record<string, SchedulingState>>(PROGRESS_KEY, {}),
  session: { learned: 0, known: 0, unknown: 0 },
  settings: loadJSON<Settings>(SETTINGS_KEY, {
    voice: 'en-US-AriaNeural',
    theme: 'dark',
    accent: 'purple',
    dailyGoal: 20,
  }),
  daily: loadJSON<Record<string, DailyStat>>(DAILY_KEY, {}),
  favorites: loadJSON<string[]>(FAV_KEY, []),
  lastShownAt: Date.now(),
  loadingList: false,

  loadLists: async () => {
    const lists = await api.getLists();
    set({ lists });
  },

  startList: async (id) => {
    set({ loadingList: true });
    try {
      const list = await api.getWordList(id);
      const meta = get().lists.find((l) => l.id === id);
      set({
        list,
        listName: meta?.name ?? '词单',
        idx: 0,
        originView: 'home',
        view: 'learn',
        session: { learned: 0, known: 0, unknown: 0 },
        lastShownAt: Date.now(),
      });
    } finally {
      set({ loadingList: false });
    }
  },

  startReview: async () => {
    // 注意：待复习的词可能来自任何一本词书，不能只在当前会话 list 里找
    // （会话结束后 list 会被清空，那样复习永远是空的）。统一走全局索引还原。
    const dueSpellings = Object.entries(get().progress)
      .filter(([, s]) => isDue(s))
      .map(([spelling]) => spelling);
    if (dueSpellings.length === 0) return;

    set({ loadingList: true });
    try {
      const due = await api.findWords(dueSpellings);
      if (due.length === 0) return;
      set({
        list: due,
        listName: '复习',
        idx: 0,
        originView: 'home',
        view: 'learn',
        session: { learned: 0, known: 0, unknown: 0 },
        lastShownAt: Date.now(),
      });
    } finally {
      set({ loadingList: false });
    }
  },

  startFavorites: async () => {
    const favs = get().favorites;
    if (favs.length === 0) return;
    set({ loadingList: true });
    try {
      const words = await api.findWords(favs);
      if (words.length === 0) return;
      set({
        list: words,
        listName: '收藏夹',
        idx: 0,
        originView: 'favorites',
        view: 'learn',
        session: { learned: 0, known: 0, unknown: 0 },
        lastShownAt: Date.now(),
      });
    } finally {
      set({ loadingList: false });
    }
  },

  startLookup: (words, query) => {
    if (words.length === 0) return;
    set({
      list: words,
      listName: `搜索：“${query}”`,
      idx: 0,
      originView: 'home',
      view: 'learn',
      session: { learned: 0, known: 0, unknown: 0 },
      lastShownAt: Date.now(),
    });
  },

  mark: (quality) => {
    const { list, idx, progress, session, daily, lastShownAt } = get();
    const word = list[idx];
    if (!word) return;

    const next = review(progress[word.spelling] ?? initialScheduling(), quality);
    const newProgress = { ...progress, [word.spelling]: next };
    save(PROGRESS_KEY, newProgress);

    // 累计学习时长（本次词停留时长）
    const elapsed = (Date.now() - lastShownAt) / 1000;
    const today = dateKey();
    const dayStat = daily[today] ?? { learned: 0, durationSec: 0 };
    const newDaily = {
      ...daily,
      [today]: {
        learned: dayStat.learned + 1,
        durationSec: dayStat.durationSec + elapsed,
      },
    };
    save(DAILY_KEY, newDaily);

    const newSession: Session = {
      learned: session.learned + 1,
      known: session.known + (quality >= 4 ? 1 : 0),
      unknown: session.unknown + (quality < 3 ? 1 : 0),
    };

    const nextIdx = idx + 1;
    if (nextIdx >= list.length) {
      set({
        progress: newProgress,
        daily: newDaily,
        session: newSession,
        view: 'home',
        list: [],
        idx: 0,
      });
    } else {
      set({
        progress: newProgress,
        daily: newDaily,
        session: newSession,
        idx: nextIdx,
        lastShownAt: Date.now(),
      });
    }
  },

  back: () => {
    const { idx, list, view } = get();
    if (view !== 'learn' || list.length === 0) return;
    if (idx > 0) set({ idx: idx - 1, lastShownAt: Date.now() });
  },

  toggleFavorite: (spelling) => {
    const favs = get().favorites;
    const next = favs.includes(spelling)
      ? favs.filter((s) => s !== spelling)
      : [...favs, spelling];
    save(FAV_KEY, next);
    set({ favorites: next });
  },

  isFavorite: (spelling) => get().favorites.includes(spelling),

  setView: (v) => set({ view: v }),

  setVoice: (v) => get().setSetting('voice', v),

  setSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value };
    save(SETTINGS_KEY, settings);
    set({ settings });
  },
}));
