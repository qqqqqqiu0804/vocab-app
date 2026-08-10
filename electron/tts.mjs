import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '../data/audio');
fs.mkdirSync(AUDIO_DIR, { recursive: true });

// 默认用系统 python；若你装在了虚拟环境，可设置环境变量 PYTHON_PATH 指向解释器
const PYTHON = process.env.PYTHON_PATH || 'python';

/**
 * 通过 Edge TTS（Python 包 edge-tts）生成发音，并做本地缓存。
 * 返回 data URL，渲染层直接用 <audio> 播放，避免 file:// 跨域问题。
 */
export async function getAudio(text, voice = 'en-US-AriaNeural') {
  const hash = crypto.createHash('md5').update(voice + '|' + text).digest('hex');
  const out = path.join(AUDIO_DIR, hash + '.mp3');

  if (!fs.existsSync(out)) {
    await new Promise((resolve, reject) => {
      const p = spawn(
        PYTHON,
        ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', out],
        { stdio: 'ignore' }
      );
      p.on('error', reject);
      p.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error('edge-tts exited ' + code))
      );
    });
  }

  const b64 = fs.readFileSync(out).toString('base64');
  return 'data:audio/mp3;base64,' + b64;
}
