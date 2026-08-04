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
npm test         # rules-engine unit tests + balance guards (49)
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
lib/i18n/id.ts  all UI copy, Bahasa Indonesia (card content lives in data/)
lib/engineBridge.ts  the single seam between UI and engine helpers
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

The board **is** the Ring of Fire: 28 hexagonal tiles in a closed ring — four coloured sectors of six tiles each, separated by four **Pos Siaga** checkpoints, with four dashed **Sea Route** arcs cutting between adjacent checkpoints. The Zona Krisis in the middle holds the round's Disaster and News cards.

Each round runs five phases: **1 Murka Cincin Api** (a Disaster card rewrites this round's rules) → **2 Kabar Mengudara** (a News card lands, villagers panic, a Crisis Token drops) → **3 Giliran Pemain** (4 AP each: move, calm, escort, investigate, play evidence onto the news card's two 5W1H locks) → **4 Sidang Fakta** (**Commit & Flip**) → **5 Dampak & Eskalasi** (tile damage, buy Rewards with Reputation, check win/lose).

**Commit & Flip** is the core mechanic. The team must lock in a verdict — HOAKS, FAKTA, or Abstain — *before* the card is turned over, and the answer plus its scientific explanation is printed on the back. Three outcomes follow:

| Outcome | Condition | Result |
|---|---|---|
| **Terverifikasi** | Verdict correct **and** both locks opened | +1 Reputation, Crisis Token cleared |
| **Tebakan Beruntung** | Verdict correct but locks incomplete | **Nothing.** Guessing right is not literacy. |
| **Hoaks Menyebar** | Verdict wrong, or Abstain | +1 Panic, draw a Chaos card |

Evacuate **10 of 16** villagers to a Pos Siaga before the Disaster deck runs out. Lose if Panic hits 8, if too few villagers remain to reach the target, or if time runs out.

A **Crisis Token locks evacuation out of its tile** — villagers are too agitated by an unresolved rumour to be led anywhere, and calming them one by one does not remove it. Only a successful verification (or the Komodo's once-per-round ability) clears it. This is what keeps media literacy load-bearing rather than decorative: `engine/balance.test.ts` asserts that a team ignoring verification loses almost every game.

See the in-game **Cara Main** page, or `../docs/Panduan-Ring-of-Fire.docx` for the full physical rulebook.
