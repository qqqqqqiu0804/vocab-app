// 通过 Tatoeba 公开 API 获取英文单词的真实双语例句（英文句 + 中文翻译）。
// 放在主进程里请求，规避浏览器 CORS 限制；渲染层通过 IPC 调用。
const API = 'https://tatoeba.org/en/api_v0/search';

/**
 * @param {string} word 英文单词
 * @param {number} limit 返回条数
 * @returns {Promise<Array<{sentence:string, translation:string, source:string}>>}
 */
export async function searchTatoeba(word, limit = 3) {
  const url = `${API}?query=${encodeURIComponent(word)}&from=eng&to=cmn&orphans=no&page=1`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('tatoeba status ' + res.status);
  const data = await res.json();
  const results = (data.results || [])
    .filter(
      (r) =>
        r &&
        r.text &&
        Array.isArray(r.translations) &&
        r.translations.length &&
        Array.isArray(r.translations[0]) &&
        r.translations[0].length
    )
    .slice(0, limit)
    .map((r) => ({
      sentence: r.text,
      translation: r.translations[0][0].text || '',
      source: 'Tatoeba',
    }));
  return results;
}
