# Ring of Fire Board Game

A cooperative, browser-based digital board game about disaster mitigation and Media & Information Literacy (MIL), set across the **Pacific Ring of Fire**. Built for the UNESCO Global Youth Hackathon 2026. Target players: senior-secondary and university students (ages 15–22).

Players are the **Wildlife Guardians** — six endemic animals, one from each corner of the Pacific — leading evacuations across real Ring-of-Fire regions (Indonesia, the Philippines, Japan, Cascadia, the Andes, the South Pacific) while filtering incoming news for hoaxes, scams, superstition and pseudoscience. Win or lose together.

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
npm test         # rules-engine unit tests + balance guards (48)
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
data/           newsCards, evidenceCards, disasterCards, chaosCards, rewardCards, roles, tileTypes, scenarios, gameConfig
store/          gameStore.ts (Zustand + persist)
lib/i18n/en.ts  all UI copy, English (card content lives in data/)
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

The board **is** the Ring of Fire: 27 hexagonal tiles — 24 forming a closed ring of six coloured sectors separated by six **Ready Posts**, plus a 3-tile **Sea Lane** cutting straight through the hole in the middle. The Sea Lane joins two opposite Ready Posts, costs 2 AP per tile (1 for the Whale Shark), carries one villager at a time, and shuts completely during an Oceanic disaster.

Six **Wildlife Guardians**, one from each corner of the Pacific: **Sumatran Tiger** (The Vanguard), **Japanese Macaque** (The Scholar), **Bald Eagle** (The Scout), **Andean Llama** (The Grounder), **Kea Parrot** (The Networker) and **Whale Shark** (The Navigator). Each has a Passive, a free Active ability once per round, and a personal Sub-Mission.

Each round runs five phases: **1 The Ring of Fire's Wrath** (a Disaster card rewrites this round's rules) → **2 Breaking News** (a News card lands, a Crisis Token drops, villagers panic) → **3 Guardian Turns** (4 AP each) → **4 The Verdict** (**Commit & Flip**) → **5 Impact & Escalation**.

**Commit & Flip** is the core mechanic. The team locks a verdict — HOAX, FACT or Abstain — *before* the card is turned over, and the answer plus its explanation is printed on the back. Three outcomes follow:

| Outcome | Condition | Result |
|---|---|---|
| **Verified** | Verdict correct **and** both locks opened | +1 Reputation, Crisis Token cleared |
| **Lucky Guess** | Verdict correct but locks incomplete | **Nothing.** Guessing right is not literacy. |
| **Rumour Spreads** | Verdict wrong, or Abstain | +1 Panic, draw a Chaos card |

Rescue **15 of 18** villagers before the 12-card Disaster deck runs out. Lose if Panic hits 6, if too few villagers remain to reach the target, or if time runs out. There is exactly one difficulty, tuned for ages 15+.

A **Crisis Token locks evacuation out of its tile** — villagers are too agitated by an unresolved rumour to be led anywhere, and calming them one by one does not remove it. Only a successful verification, or the Andean Llama's once-per-round ability, clears it. That is what keeps media literacy load-bearing: `engine/balance.test.ts` asserts a competent team wins about 10 of 12 seeded games while a team ignoring verification loses all 12.


See the in-game **How to Play** page, or `../docs/Panduan-Ring-of-Fire.docx` for the full physical rulebook (in Bahasa Indonesia).
