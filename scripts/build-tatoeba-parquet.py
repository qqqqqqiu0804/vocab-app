#!/usr/bin/env python3
"""
用 HuggingFace 镜像上的 Tatoeba 英中平行句对（sentence-transformers/parallel-sentences-tatoeba, en-zh）
离线构建双语例句包：public/tatoeba-offline.json

为什么不用逐词打 Tatoeba API / 官方全量导出包？
  - 该网络（中国）对 tatoeba.org API 限速极严（429 + 超时，1.4 万词要数小时且大量失败）；
  - downloads.tatoeba.org 大文件仅 8KB/s，720MB 要 25 小时，基本不可用。
  - 改用 hf-mirror.com 拉取已对齐好的 en-zh parquet（2.5MB，秒下），本地流式匹配，零限速。

产物格式与旧版一致：{ [word]: [{ sentence, translation, source }] }
"""
import json
import os
import re
import subprocess
import sys

try:
    from opencc import OpenCC
    _cc = OpenCC("t2s")  # 繁体 -> 简体，对大陆用户更友好
    def to_simplified(s):
        return _cc.convert(s) if s else s
except Exception:
    def to_simplified(s):
        return s

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache", "tatoeba")
PARQUET = os.path.join(CACHE, "en-zh.parquet")
INDEX = os.path.join(ROOT, "public", "dicts", "index.json")
OUT = os.path.join(ROOT, "public", "tatoeba-offline.json")

PARQUET_URL = (
    "https://hf-mirror.com/datasets/sentence-transformers/parallel-sentences-tatoeba/"
    "resolve/main/en-zh/train-00000-of-00001.parquet"
)
CAP_PER_WORD = 3          # 每词最多例句数（控制体积，3 条够用）
MAX_SUFFIX = 3            # 轻度变形尾缀长度（states/state's 等）
TOK_RE = re.compile(r"[^a-z0-9]+")


def ensure_parquet():
    if os.path.exists(PARQUET) and os.path.getsize(PARQUET) > 1000:
        return
    os.makedirs(CACHE, exist_ok=True)
    print(f"[parquet] 下载 en-zh 平行句对 -> {PARQUET}", flush=True)
    # 用系统 curl 经镜像拉取（国内快）；失败则提示
    r = subprocess.run(["curl", "-sL", "-o", PARQUET, PARQUET_URL])
    if r.returncode != 0 or os.path.getsize(PARQUET) < 1000:
        sys.exit("下载 parquet 失败，请手动下载后放入 .cache/tatoeba/en-zh.parquet")
    print(f"[parquet] 下载完成：{os.path.getsize(PARQUET)} bytes", flush=True)


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
    ensure_parquet()
    import pyarrow.parquet as pq

    targets = load_targets()
    existing = load_existing()
    done = set(existing.keys())
    active = set(w for w in targets if w not in done)
    print(f"[parquet] 目标词 {len(targets)}，已离线 {len(done)}，本次待处理 {len(active)}", flush=True)

    # 读 parquet
    t = pq.read_table(PARQUET)
    pairs = list(zip(t.column("english").to_pylist(), t.column("non_english").to_pylist()))
    print(f"[parquet] 平行句对 {len(pairs)} 条", flush=True)

    collected = {w: [] for w in active}
    n = 0
    for en, zh in pairs:
        if not en or not zh:
            continue
        tokens = set(tok for tok in TOK_RE.split(en.lower()) if tok)
        for w in (tokens & active):
            if len(collected[w]) < CAP_PER_WORD:
                collected[w].append((en, zh))
                if len(collected[w]) >= CAP_PER_WORD:
                    active.discard(w)
        n += 1
        if n % 10000 == 0:
            print(f"  … 已扫 {n} 句，命中 {sum(1 for v in collected.values() if v)} 词", flush=True)
        if not active:
            print(f"  ✓ 全部待处理词已集满，提前结束（{n} 句）", flush=True)
            break

    have = sum(1 for v in collected.values() if v)
    print(f"[parquet] 匹配完成：{have}/{len(targets)-len(done)} 词获得例句", flush=True)

    # 组装：以已有包为底，parquet 结果覆盖（同词取 parquet 的）
    result = dict(existing)
    added = 0
    for w, items in collected.items():
        if not items:
            continue
        items.sort(key=lambda x: len(x[0]))  # 短句优先
        exs = [
            {"sentence": e, "translation": to_simplified(z), "source": "Tatoeba"}
            for e, z in items[:CAP_PER_WORD]
        ]
        result[w] = exs
        added += 1

    # 统一转简体（含已有 84 词），保证全包一致
    for exs in result.values():
        for ex in exs:
            ex["translation"] = to_simplified(ex["translation"])

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

    kb = os.path.getsize(OUT) / 1024
    print(f"[parquet] 完成！新增 {added} 词，累计 {len(result)}/{len(targets)} 词 -> {OUT} ({kb:.1f} KB)", flush=True)


if __name__ == "__main__":
    main()
