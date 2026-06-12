# YOLO Merge

**Ship it live.** A satirical merge-to-prod clicker dressed up like Cursor — mash merge, ignore Undo All, unlock badges, and climb from Junior Merge Intern to Chief Merge Officer.

Built for the Cursor hackathon in SF.

## Play

```bash
cp .env.example .env   # optional — or export CURSOR_API_KEY directly
npm install
npm start
```

Open [http://localhost:8765](http://localhost:8765). On first visit you get the CEO all-hands intro. Hit **Intro** in the header to replay it.

### Cursor API key (optional)

With a key, the **Cursor Agent** generates fresh roasts, hype lines, and PR titles. Without one, the game uses built-in fallback copy and works fully offline.

```bash
export CURSOR_API_KEY="cursor_..."   # Cursor Dashboard → Integrations → API Keys
```

The key stays on the server (`server.mjs` reads `.env` or the environment). The browser never sees it.

## How to play

- **Merge** — click the send button or press **Space** (also **Merge to Prod** pill)
- **Undo All / Review** — wrong buttons; you get roasted, badges, and story beats
- **Velocity upgrades** — spend merged PRs on auto-merge bots, skip CI, disable branch protection
- **Badges** — open the **Badges** panel to see achievements (15 total)
- **Story** — CEO Chad and CTO Dana interrupt at milestones

Progress (badges, story, intro) is saved in `localStorage`.

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
