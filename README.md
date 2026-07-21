# Ring of Fire Board Game

A cooperative, browser-based digital board game about disaster mitigation and Media & Information Literacy (MIL), set across the **Pacific Ring of Fire**. Built for the UNESCO Global Youth Hackathon 2026. Target players: primary–middle school students (ages 10–15).

Players are the **Guardian Wildlife** — endemic animal heroes (Eagle, Komodo Dragon, Monkey, Orangutan, Tiger) leading evacuations across real Ring-of-Fire regions (Japan, the Philippines, the Sunda Strait, New Zealand, Chile, Alaska…) while filtering incoming news for hoaxes, scams, superstition, and pseudoscience. Win or lose together.

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — zero-config Vercel deploy
- **Tailwind CSS v4** — mobile-first
- **Zustand** (+ persist middleware) — game state, saved to `localStorage`
- **Framer Motion** — phase transitions & card reveals
- **Vitest** — pure rules-engine unit tests

The rules engine (`engine/`) is a pure `(state, action) => state` reducer with **no DOM/React dependency**, so it is fully unit-tested and ready to be layered with online multiplayer later (transport-agnostic by design).

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # rules-engine unit tests (18)
npm run build    # production build
```

Enable the hidden playtest/debug panel with an env flag:

```bash
# .env.local
NEXT_PUBLIC_DEBUG=1
```

## Project layout

```
app/            Home, Setup, Play, How-to-Play screens (App Router)
components/     board/ (map + tiles), hud/, cards/, ui/, modals
engine/         types.ts, reducer.ts (pure), rules.ts, engine.test.ts
data/           eventCards, evidenceCards, disasterCards, roles, tileTypes, scenarios, gameConfig
store/          gameStore.ts (Zustand + persist)
lib/i18n/en.ts  all UI copy (card content lives in data/)
```

`PLAN.md` tracks the build chunks; `DECISIONS.md` logs every design assumption.

## Deploy to Vercel

The project is a standard Next.js App Router app with **no custom server and no required environment variables** — it deploys with zero extra configuration.

**Option A — GitHub + Vercel dashboard (recommended):**

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — keep the defaults (`next build`), click **Deploy**.
4. Open the production URL and play through on a phone and desktop.

**Option B — Vercel CLI:**

```bash
npm i -g vercel
vercel login          # authenticate with your Vercel account
vercel --prod         # deploy to production
```

No env vars are needed for the current single-device (pass-and-play) build. If you later add the online-multiplayer stretch goal, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project settings.

## How to play (short version)

Each round has 4 phases: **Incoming Crisis** (a news card appears and villagers panic) → **Filter Hoax vs. Fact** (play one matching Evidence card to open a 5W1H lock and reveal the truth) → **Rescue Action** (spend Action Points to move, calm, and escort villagers to a Safe Zone) → **The Ring of Fire's Wrath** (a Disaster card twists the next round and can destroy a tile). Evacuate 8 of 15 villagers before the Disaster Deck runs out. Keep the Panic Meter below 5. See the in-game **How to Play** page for the full rules.
