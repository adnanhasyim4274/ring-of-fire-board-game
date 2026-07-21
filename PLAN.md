# Ring of Fire Board Game — Build Plan

Chunk plan per spec Section 13. Checkboxes updated as chunks complete.

## Phase 0 — Blocking, sequential
- [x] **Chunk 0: Scaffold & Tooling** — `create-next-app` (TypeScript, Tailwind, App Router, ESLint), install zustand / framer-motion / lucide-react / vitest, verify `npm run dev` and `npm run build`. Author the shared type contract (`engine/types.ts`) that every other chunk depends on.

## Phase 1 — Parallelizable (independent chunks)
- [x] **Chunk A — Data Layer** — `data/eventCards.ts`, `data/evidenceCards.ts`, `data/disasterCards.ts`, `data/roles.ts`, `data/tileTypes.ts`, `data/scenarios.ts`, `data/gameConfig.ts`. All Section 6 content verbatim + added cards for replayability.
- [x] **Chunk B — Rules Engine & Reducer** — `engine/reducer.ts` (pure `(state, action) => newState`), `engine/rules.ts` (`checkGameOver`, lock resolution, disaster effects), unit tests in `engine/engine.test.ts`.
- [x] **Chunk C — Static UI Shell** — `components/board/*` (MapGrid, Tile, VillagerToken), `components/hud/*` (PanicMeter, DisasterDeckCounter, APCounter, PhaseIndicator), `components/cards/*` (EventCardDisplay, EvidenceCardHand, DisasterCardReveal), shared UI primitives.
- [x] **Chunk D — i18n String Scaffolding** — `lib/i18n/en.ts`; all UI copy routed through it.

## Phase 2 — Integration
- [x] **Chunk E — Store Wiring** — Zustand store + persist middleware wrapping the pure reducer with real data decks.
- [x] **Chunk F — Screen Flows** — Home → Setup → Play → Game Over wired to the store; How to Play page.

## Phase 3 — Parallelizable polish
- [x] **Chunk G — Animation & Polish** — Framer Motion phase transitions, card reveals, action feedback.
- [x] **Chunk H — Mobile Responsiveness Pass** — verified at 375px width and desktop.
- [x] **Chunk I — Tutorial / How-to-Play Screen.**
- [x] **Chunk J — Test Coverage & Debug Panel** — rules-engine unit tests (wildcard verification, disaster AP cost, all 3 lose conditions + win), hidden debug panel behind `NEXT_PUBLIC_DEBUG` flag.

## Phase 4 — Deployment
- [x] **Chunk K — Deployment prep** — production build verified, README deploy instructions written. Actual `vercel --prod` / GitHub import requires the team's accounts (cannot be done from this environment) — see README.md §Deploy.

## Phase 5 — Stretch (not in MVP)
- [ ] **Chunk L — Multiplayer Layer** (Supabase Realtime / PartyKit) — deliberately deferred per spec §3.1 and §10.
