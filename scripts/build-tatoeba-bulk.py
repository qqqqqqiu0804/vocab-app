#!/usr/bin/env python3
"""
用 Tatoeba 官方批量导出包离线构建双语例句包：public/tatoeba-offline.json

相比旧版逐词打 api_v0/search（约 1 词/3 秒，1.4 万词要 12 小时），本脚本：
  - 下载一次 sentences.csv（全语言）+ links.csv，本地流式处理，零 API 限速。
  - 扫描英文句匹配目标词（词边界 + 轻度变形），关联中文翻译。
  - 内存安全：三遍流式扫描，中文句按需收集，不一次性全量入内存。
  - 断点续传：与已有 public/tatoeba-offline.json 合并，已覆盖词跳过。
  - 体积可控：每词最多保留 4 条例句（优先短句，适合 TTS/展示）。

数据格式（实测）：sentences.csv / links.csv 均为 TAB 分隔、无表头。
  sentences.csv:  id \t lang \t text
  links.csv:      sentence_id \t translation_id

产物：{ [word]: [{ sentence, translation, source }] }
"""
import csv
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "public", "dicts", "index.json")
SENTENCES = os.path.join(ROOT, ".cache", "tatoeba", "sentences.csv")
LINKS = os.path.join(ROOT, ".cache", "tatoeba", "links.csv")
OUT = os.path.join(ROOT, "public", "tatoeba-offline.json")

CAP_PER_WORD = 4          # 每词最多例句数
MAX_SUFFIX = 3            # 轻度变形允许的尾缀长度（states/state's 等）
PROGRESS_EVERY = 500000   # 扫描进度打印间隔（行数）

TOK_RE = re.compile(r"[^a-z0-9]+")


def load_targets():
    with open(INDEX, encoding="utf-8") as f:
        rows = json.load(f)
    return sorted({r["w"] for r in rows if r.get("w")})


def load_existing():
    if os.path.exists(OUT):
        try:
            with open(OUT, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def main():
    targets = load_targets()
    existing = load_existing()
    done = set(existing.keys())
    active = set(w for w in targets if w not in done)
    print(f"[bulk] 目标词 {len(targets)}，已离线 {len(done)}，本次待处理 {len(active)}", flush=True)
    if not active:
        print("[bulk] 没有需要新处理的词，离线包已是最新。")
        return

    collected = {w: [] for w in active}   # word -> [(id, text)]
    collected_ids = set()

    # ---- Pass 1：扫描 sentences.csv，收集英文匹配 ----
    print("[bulk] Pass1: 扫描 sentences.csv 收集英文例句 ...", flush=True)
    with open(SENTENCES, encoding="utf-8", newline="") as f:
        reader = csv.reader(f, delimiter="\t")
        n = 0
        for row in reader:
            n += 1
            if len(row) < 3 or row[1] != "eng":
                continue
            sid, text = row[0], row[2]
            tokens = set(t for t in TOK_RE.split(text.lower()) if t)
            for w in (tokens & active):
                if len(collected[w]) < CAP_PER_WORD:
                    collected[w].append((sid, text))
                    collected_ids.add(sid)
                    if len(collected[w]) >= CAP_PER_WORD:
                        active.discard(w)
            if n % PROGRESS_EVERY == 0:
                print(f"  … 已扫描 {n} 行，命中 {sum(1 for v in collected.values() if v)} 词", flush=True)
            if not active:
                print(f"  ✓ 全部待处理词已集满，提前结束（{n} 行）", flush=True)
                break

    have = sum(1 for v in collected.values() if v)
    print(f"[bulk] 英文匹配完成：{have}/{len(targets)-len(done)} 词有候选例句", flush=True)

    # ---- Pass 2：扫描 links.csv，建立 eng_id -> [cmn_id] ----
    print("[bulk] Pass2: 扫描 links.csv 建立英→中映射 ...", flush=True)
    eng2cmn = {}
    with open(LINKS, encoding="utf-8", newline="") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if len(row) < 2:
                continue
            eid, cid = row[0], row[1]
            if eid in collected_ids:
                eng2cmn.setdefault(eid, []).append(cid)
    print(f"[bulk] 关联完成：{len(eng2cmn)} 个英文句有翻译链接", flush=True)

    # 需要的 cmn id 集合（去重）
    needed_cmn = set()
    for ids in eng2cmn.values():
        needed_cmn.update(ids)

    # ---- Pass 3：再扫 sentences.csv，按需收集中文文本 ----
    print(f"[bulk] Pass3: 扫描 sentences.csv 收集 {len(needed_cmn)} 个中文翻译 ...", flush=True)
    cmn = {}
    with open(SENTENCES, encoding="utf-8", newline="") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if len(row) < 3 or row[1] != "cmn":
                continue
            if row[0] in needed_cmn:
                cmn[row[0]] = row[2]
    print(f"[bulk] 命中中文句 {len(cmn)} 条", flush=True)

    # ---- 组装 ----
    result = dict(existing)
    added = 0
    for w, items in collected.items():
        if not items:
            continue
        items.sort(key=lambda x: len(x[1]))   # 短句优先
        exs = []
        for sid, text in items:
            cids = eng2cmn.get(sid, [])
            trans = cmn.get(cids[0]) if cids else ""
            if not trans:
                continue
            exs.append({"sentence": text, "translation": trans, "source": "Tatoeba"})
            if len(exs) >= CAP_PER_WORD:
                break
        if exs:
            result[w] = exs
            added += 1

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

    kb = os.path.getsize(OUT) / 1024
    print(f"[bulk] 完成！新增 {added} 词，累计 {len(result)}/{len(targets)} 词 -> {OUT} ({kb:.1f} KB)", flush=True)


if __name__ == "__main__":
    main()
