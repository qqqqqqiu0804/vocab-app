# 不背单词 · 复刻版（MVP）

基于 **Electron + React + Vite + TypeScript + Edge TTS** 的「在语境里记单词」桌面应用骨架。

> 当前为最小可用版本（MVP）：单词卡 + 语境例句 + 遗忘曲线复习（SM-2）+ 真人级发音。

## 功能

- 📇 单词卡：拼写 / 音标 / 词性 / 中文释义
- 📚 语境例句：每个词配真实英文句子 + 翻译（ soul 功能）
- 🔊 发音：优先 Edge TTS（神经语音，美/英音可切换），离线时自动回退浏览器内置语音
- 🧠 复习算法：SM-2 遗忘曲线调度「认识 / 模糊 / 不认识」
- 📊 进度：今日学习量、待复习数、掌握统计

## 目录结构

```
electron-vocab/
├── electron/
│   ├── main.mjs        # 主进程：创建窗口 + 注册 TTS IPC
│   ├── preload.mjs     # 安全暴露接口给渲染层
│   └── tts.mjs         # Edge TTS 封装（调用 python edge-tts，本地缓存）
├── src/
│   ├── main.tsx
│   ├── App.tsx         # 顶栏 + 视图路由
│   ├── api.ts          # 数据访问层（当前读内置词库，可换 IPC）
│   ├── store.ts        # zustand 状态 + 进度持久化
│   ├── types.ts
│   ├── data/words.ts   # 内置六级样例词库（开箱即跑）
│   ├── scheduler/sm2.ts # SM-2 算法（纯函数）
│   ├── components/      # WordCard / ExampleSentence / AudioButton
│   └── pages/          # Home / Learn / Review
├── scripts/
│   ├── import-ecdict.js  # ECDICT CSV -> SQLite（全量词典）
│   └── build-wordlist.js # 单词清单 txt -> 词单 JSON
├── data/audio/         # TTS 生成的 mp3 缓存
└── vite.config.ts
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 方式 A：纯网页预览（无需 GUI，浏览器打开即可看 UI + 用 Web Speech 发音）
npm run dev:web
#    打开 http://localhost:5173

# 2. 方式 B：启动 Electron 桌面应用（需本机有显示）
npm run dev
#    依赖 Edge TTS：另需 pip install edge-tts（可选，不装也能用浏览器语音）
```

> 在沙箱/无显示环境里用 `npm run dev:web` 验证界面最方便；发音会回退到 Web Speech API。

## 接入全量词库（可选，进阶）

1. 下载 [ECDICT](https://github.com/skywind3000/ECDICT) 的 `stardict.csv`
2. `npm i better-sqlite3`
3. `npm run import-ecdict stardict.csv` 生成 `data/dict.db`
4. 准备一份四六级/考研单词清单 `cet6.txt`（每行一词），运行
   `npm run build-wordlist cet6.txt cet6 六级核心词` 生成词单 JSON
5. 在 `src/api.ts` 把词库来源从内置 `words.ts` 换成读取 JSON / IPC 即可

## 下一步（v2 建议）

- 统计图表（掌握度曲线）
- 词书内搜索 / 收藏
- 例句语料升级（接入 Tatoeba 等开放句库，按词过滤）
- 用 electron-builder 打包 exe 安装包
- 复习算法升级到 FSRS（更省时间、更准）
