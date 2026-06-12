# Merge Please

**Papers, Please** meets code review. **Cursor Agent** sends pull requests — you stamp **MERGE** or **BLOCK** before the timer runs out.

- Buggy code → **BLOCK** · Clean code → **MERGE**
- 3 lives, 20s per PR, combo streaks, SEV-1 boss rounds (every 5th)
- AI-generated PR titles, authors, roasts, and praise

Built for the Cursor hackathon in SF.

## Play (recommended)

Uses the Cursor SDK locally — your API key stays on the server, not in the browser.

```bash
export CURSOR_API_KEY="cursor_..."   # Cursor Dashboard → Integrations → API Keys
npm install
npm start
```

Open http://localhost:8765 and hit **Start Game**. No key prompt in the UI.

## Offline / no server

Open `index.html` directly (or any static host) and the game falls back to 10 built-in puzzles. The status line tells you which mode you're in.

## How it works

```
Browser (index.html)  →  POST /api/round  →  server.mjs
                                              ↓
                                    Agent.prompt() via @cursor/sdk
                                    model: composer-2.5, local runtime
```

The server reads `CURSOR_API_KEY` from your environment. The frontend never sees it.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Game UI + client logic |
| `server.mjs` | Static host + Cursor Agent puzzle generator |
| `package.json` | `@cursor/sdk` dependency |
| `.env.example` | Example env var (copy to `.env` if you use one) |
| `Design doc` | Original spec |

## Dev tip

Set `const ROUNDS = 3` in `index.html` while iterating; restore to `10` before the demo.
