# YOLO Merge

**Ship it live.** A satirical merge-to-prod clicker dressed up like Cursor — mash merge, ignore Undo All, unlock badges, and climb from Junior Merge Intern to Chief Merge Officer.

Built for the Cursor hackathon in SF.

## Setup

### Prerequisites

- **Node.js 18+** (20+ recommended)
- **npm** (comes with Node)
- **Cursor API key** (optional) — for AI-generated agent lines; the game works without it using built-in fallback copy

### 1. Clone the repo

```bash
git clone https://github.com/hellohelldar/cursor-game.git
cd cursor-game
```

### 2. Install dependencies

```bash
npm install
```

This installs `@cursor/sdk`, which the server uses to call the Cursor Agent locally.

### 3. Configure environment (optional)

For AI lines, add your Cursor API key. Get one from **Cursor Dashboard → Integrations → API Keys**.

**Option A — `.env` file (recommended for local dev):**

```bash
cp .env.example .env
```

Edit `.env`:

```env
CURSOR_API_KEY=cursor_your_key_here
```

**Option B — shell export:**

```bash
export CURSOR_API_KEY="cursor_your_key_here"
```

Optional: change the port (default `8765`):

```env
PORT=8765
```

The key is read only by `server.mjs` on the server. It is never sent to the browser.

### 4. Start the server

```bash
npm start
```

You should see:

```text
YOLO Merge → http://localhost:8765
Cursor API key: configured
```

If the key is missing, the server still runs and prints `MISSING — local lines only`.

### 5. Open the game

Visit [http://localhost:8765](http://localhost:8765) in your browser.

On first visit you get the CEO all-hands intro. Use **Intro** in the header to replay it.

### Verify setup

Check that the server is up and whether the API key is loaded:

```bash
curl http://localhost:8765/api/health
```

Example response with a key configured:

```json
{"ok":true,"cursorConfigured":true,"game":"yolo-merge"}
```

### Static-only mode (no server)

You can open `index.html` directly in a browser for offline play. Agent lines use fallbacks only; merge/upgrades/badges still work.

## Play

After [setup](#setup), open [http://localhost:8765](http://localhost:8765) and click through the CEO all-hands intro (or hit **Intro** later to replay it).

### Goal

Merge as many PRs to prod as you can. Every merge earns PR count and lines changed. Wrong clicks get you roasted — that’s the point.

### Controls

| Action | How |
|--------|-----|
| **Merge** | Click the ↑ send button, **Merge to Prod** pill, or press **Space** |
| **Undo All** | Don’t — unless you want roasts and the *Wait, What?* badge |
| **Review** | Also don’t — unless you want the *Process Person* badge |
| **Replay intro** | **Intro** button in the header |
| **Badges** | Expand the **Badges** panel at the bottom |
| **Upgrades** | Expand **Velocity upgrades** and spend merged PRs |

During story pop-ups, **Next** / **Enter** / **Space** advance the dialogue.

### Loop

1. **Merge** — ship the current branch; a new fake PR appears in the composer.
2. **Earn** — PR count and line stats go up; merge rate (`/sec`) tracks how fast you click.
3. **Spend** — buy auto-merge bots and other upgrades so PRs merge while you sleep (metaphorically).
4. **Unlock** — badges for milestones (first merge, speed, lines, buying upgrades, etc.).
5. **Level up** — your role title changes as PR count grows (Intern → Chief Merge Officer).

### Story & badges

- **Story beats** — CEO Chad and CTO Dana cut in at milestones (1, 10, 50, 100+ merges, first upgrade, first reject/review).
- **Badges** — 15 total; locked ones show as `???` until you earn them. Rewards apply automatically (bonus PRs, lines, merge multiplier).
- **Progress** — badges, story, and intro state persist in `localStorage` in your browser.

### Tips

- Merge fast early to stack `/sec` and unlock speed badges.
- Buy **Auto-merge bot** first — passive merges compound quickly.
- With `CURSOR_API_KEY` set, **Cursor Agent** lines are AI-generated; without it, built-in fallback copy still works.

## Architecture

```
Browser (index.html)
  → POST /api/line   →  server.mjs  →  Agent.prompt() via @cursor/sdk
  → GET  /api/health     (composer-2.5, local runtime)
```

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Server status + whether Cursor API is configured |
| `POST /api/line` | Agent-generated line for merge / reject / review / levelup / badge |

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | Game UI, idle loop, badges, story, upgrades |
| `server.mjs` | Static file host + Cursor Agent line generator |
| `package.json` | `@cursor/sdk` dependency |
| `.env.example` | Example env vars |
| `Design doc` | Original design notes |

## License

MIT — hackathon project, merge responsibly.
