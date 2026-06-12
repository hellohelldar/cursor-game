import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Agent } from '@cursor/sdk';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = process.env.PORT || 8765;
const apiKey = process.env.CURSOR_API_KEY;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const FALLBACK = {
  merge: [
    { title: 'Cursor Agent', message: 'LGTM. I also wrote this PR. I also merged it.' },
    { title: 'CEO Chad', message: 'Another merge! The board thinks this is AI. It\'s just you clicking.' },
    { title: 'CTO Dana', message: 'Prod hiccupped. We\'re calling it a soft launch feature.' },
    { title: 'Deploy bot', message: 'Shipping to prod. Tests are a social construct.' },
    { title: 'Slack #ship-it', message: 'Main is just a suggestion at this point. Respect.' },
  ],
  reject: [
    { title: 'Cursor Agent', message: 'Bro are u serious? We need velocity not vibes.' },
    { title: 'CEO Chad', message: 'Undo All?? That\'s not in the culture doc I never wrote.' },
    { title: 'Your manager', message: 'The roadmap said merge. The roadmap does not say review.' },
  ],
  review: [
    { title: 'Cursor Agent', message: 'Bro are u serious? Request review on a hotfix at 2am?' },
    { title: 'CTO Dana', message: 'Review? Chad merged twelve PRs during your standup.' },
    { title: 'Slack #eng', message: 'Someone requested review. Everyone else already merged.' },
  ],
  levelup: [
    { title: 'CEO Chad', message: 'Promoted! Zero raise. Infinite pager duty. Keep shipping.' },
    { title: 'CTO Dana', message: 'New title, same blame when prod sneezes. Congrats.' },
    { title: 'Cursor Agent', message: 'Level up. I updated your Slack title without permission.' },
  ],
  badge: [
    { title: 'Cursor Agent', message: 'Badge unlocked. Already posted it to your LinkedIn.' },
    { title: 'CEO Chad', message: 'Achievement unlocked! Put it in the investor deck.' },
    { title: 'HR Bot', message: 'Badge noted. Still no vacation days. Merge more.' },
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseJson(text) {
  let raw = text.replace(/```json?\n?|\n?```/g, '').trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) raw = match[0];
  const parsed = JSON.parse(raw);
  if (!parsed.message) throw new Error('no message');
  return {
    title: String(parsed.title || 'Cursor Agent').slice(0, 40),
    message: String(parsed.message).slice(0, 160),
    prTitle: parsed.prTitle ? String(parsed.prTitle).slice(0, 80) : undefined,
  };
}

async function generateLine(action, stats) {
  const {
    prs = 0,
    lines = 0,
    mergesPerSec = 0,
    role = 'Intern',
    prevRole = '',
    badgeName = '',
  } = stats;
  const pool = FALLBACK[action] || FALLBACK.merge;

  if (!apiKey) return { ...pick(pool), source: 'fallback' };

  const prompts = {
    merge: `Absurd YOLO merge-to-prod clicker. Player role: "${role}". ${prs} PRs, ${lines} lines, ${mergesPerSec.toFixed(1)}/sec.
Speakers: CEO Chad, CTO Dana, Cursor Agent, Slack, CI bot. Ship-fast startup satire.
Return ONLY JSON: {"title":"speaker","message":"one funny hype line max 18 words","prTitle":"funny fake PR title like fix: or feat:"}`,
    reject: `Player clicked UNDO ALL instead of merge. Role: ${role}. ${prs} PRs merged. YOLO merge game satire.
Return ONLY JSON: {"title":"CEO Chad or Cursor Agent","message":"roast like 'bro are u serious' max 18 words"}`,
    review: `Player clicked REVIEW instead of merge. Role: ${role}. ${prs} PRs merged.
Return ONLY JSON: {"title":"CTO Dana or Cursor Agent","message":"mock review culture max 18 words"}`,
    levelup: `Player promoted from "${prevRole}" to "${role}" after ${prs} PRs in a merge clicker game.
Speakers: CEO Chad, CTO Dana, Cursor Agent. Funny corporate promotion, zero raise, infinite pager duty.
Return ONLY JSON: {"title":"speaker","message":"promotion roast max 18 words"}`,
    badge: `Player unlocked badge "${badgeName}" as ${role} with ${prs} PRs merged. Startup ship-fast satire.
Return ONLY JSON: {"title":"speaker","message":"funny badge congrats max 18 words"}`,
  };

  try {
    const result = await Agent.prompt(prompts[action] || prompts.merge, {
      apiKey,
      model: { id: 'composer-2.5' },
      local: { cwd: __dirname, settingSources: [] },
    });
    if (result.status === 'error') throw new Error('agent error');
    return { ...parseJson(result.result ?? ''), source: 'cursor-agent' };
  } catch (err) {
    console.warn('Agent line failed:', err.message);
    return { ...pick(pool), source: 'fallback' };
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/line') {
    try {
      const body = await readBody(req);
      let data = {};
      try { data = JSON.parse(body || '{}'); } catch { /* ignore */ }
      const action = ['merge', 'reject', 'review', 'levelup', 'badge'].includes(data.action)
        ? data.action
        : 'merge';
      const line = await generateLine(action, data.stats || {});
      json(res, 200, { ok: true, ...line });
    } catch (err) {
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    json(res, 200, { ok: true, cursorConfigured: Boolean(apiKey), game: 'yolo-merge' });
    return;
  }

  const filePath = join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`YOLO Merge → http://localhost:${PORT}`);
  console.log(`Cursor API key: ${apiKey ? 'configured' : 'MISSING — local lines only'}`);
});
