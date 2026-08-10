export interface Example {
  /** 英文原句 */
  sentence: string;
  /** 中文翻译 */
  translation: string;
  /** 例句出处（电影/书籍/新闻等），是不背单词「真实语境」的灵魂字段 */
  source?: string;
}

/** 一个词性下的多条释义 */
export interface PosMeaning {
  pos: string; // 词性标签，如 "vt." "n." "vi. vt."
  defs: string[]; // 该词性下的多条释义（分号并列风格）
}

export interface WordEntry {
  spelling: string;
  phonetic?: string;
  /** 多词性释义 */
  meanings: PosMeaning[];
  examples: Example[];
}

export interface WordListMeta {
  id: string;
  name: string;
  count: number;
}
