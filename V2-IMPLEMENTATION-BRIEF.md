# DEMO v2.0 — Implementation Brief

Upgrading the Next.js demo from the old v1 rules to the canonical v2.0 board game.

**Read first:** `E:\archives\ringoffire\ring-of-fire\engine\types.ts` — the v2 type contract, already
written and frozen. Build against it exactly; do not edit it.
**Game content source:** `E:\archives\ringoffire\docs\00-MASTER-SPEC-v2.md`.

---

## STRICT FILE OWNERSHIP — do not touch files outside your lane

| Lane | Owns | Must NOT touch |
|---|---|---|
| **A — DATA** | `data/**` | engine/, components/, app/, store/, lib/ |
| **B — ENGINE** | `engine/rules.ts`, `engine/reducer.ts`, `engine/engine.test.ts` | data/, components/, app/, store/, lib/, engine/types.ts |
| **C — UI** | `components/**`, `app/**`, `lib/**` | data/, engine/, store/ |
| **Integrator** | `engine/types.ts`, `store/gameStore.ts`, final build fixes | — |

Everything is typed against `engine/types.ts`, so the lanes do not need each other's output to start.
If you need a value that another lane owns, import it by its declared name and trust the type.

---

## WHAT CHANGED FROM v1 (the whole point of this upgrade)

| Area | v1 (old demo) | v2 (build this) |
|---|---|---|
| Board | 7×5 grid with ocean tiles | **Ring of 28 tiles**, closed loop, 4 sectors + 4 Pos Siaga |
| Movement | grid adjacency | rim adjacency `(i±1) mod 28` + **4 Sea Route edges** |
| Phases | 4 | **5**: Disaster → News → Turns → Verdict → Impact |
| Verification | play 1 matching card, instant reveal | **Commit & Flip**: open BOTH locks → commit verdict → flip → 3 outcomes |
| Outcomes | success / ignored | **terverifikasi / tebakan_beruntung / hoaks_menyebar** |
| AP | 3 | **4** |
| Panic max | 5 | **8** |
| Villagers | 15, target 8 | **16, target 10** |
| Tile damage | instant destroy | **2 stages: Normal → Retak → Hancur** |
| Roles | 1 ability | **Passive + Active(0 AP, 1×/round) + Sub-Mission** |
| Economy | none | **Reputation points → buy Reward cards** |
| Failure | panic only | **+ Chaos cards accumulate** |
| Evidence categories | 5 | **6 (WHEN added)** |

---

## RING TOPOLOGY (shared mental model — everyone needs this)

```
28 tiles, indices 0..27, closed loop.
Pos Siaga (checkpoint + bonus stage, damage-immune): 0, 7, 14, 21
Sector merah  : 1..6      Sector teal  : 8..13
Sector kuning : 15..20    Sector biru  : 22..27

Rim adjacency : (i-1+28)%28  and  (i+1)%28
Sea Routes (4): [0,7] [7,14] [14,21] [21,0]
  -> each connects two ADJACENT Pos Siaga, skipping 6 tiles.
  -> cost 2 AP, max 1 villager escorted, CLOSED when active disaster
     category === "oseanografi".
```

Rendering note for UI: place tile *i* at angle `(i / 28) * 2π - π/2` on a circle. It is a real ring.

---

## THE STAR MECHANIC — Commit & Flip (get this exactly right)

Fase 4 runs in three steps and the order is not negotiable:

1. **Locks** — during Fase 3, players play Evidence onto the news card's two 5W1H locks.
   A 3-point HOW card is a wildcard and opens any lock.
2. **COMMIT_VERDICT** — the table commits `"hoax" | "fakta" | "abstain"`. Once set, `verdict`
   is immutable. UI must make this feel final.
3. **FLIP_NEWS** — sets `newsRevealed = true`, exposing `truth`, `explanation`, `redFlags`.

Then resolve into exactly one `VerdictOutcome`:

| Outcome | Condition | Effect |
|---|---|---|
| `terverifikasi` | verdict matches `truth` **AND** both locks opened | **+1 reputation**, clear crisis token, apply `ifValidated` |
| `tebakan_beruntung` | verdict matches `truth` but locks incomplete | **no reputation**, crisis token stays, no other effect |
| `hoaks_menyebar` | verdict wrong, or `abstain` | **+1 panic**, draw 1 Chaos card, apply `ifIgnored` |

`tebakan_beruntung` is the educational heart — guessing right is not literacy. Do not silently
merge it into `terverifikasi`.

---

## ACTION COSTS (Fase 3, 4 AP per player per round)

| Action | AP |
|---|---|
| Move to adjacent rim tile | 1 (2 if target is Retak) |
| Move via Sea Route | 2 |
| Calm villager (panik → tenang) | 2 (3 under `calm_cost_up`) |
| Escort villager(s) | 1 (Harimau may take 2 villagers for the same 1 AP) |
| Investigate (draw 1 evidence) | 1 |
| Play evidence onto a lock | 0 |
| Discard evidence for resource | 0 |
| Barter | 1 |
| Active ability | 0, once per round |

Hand limit 4 (Orangutan 6), checked at end of that player's own turn.

---

## WIN / LOSE (checked in Fase 5)

- **Win** — `evacuees.length >= targetEvacuation` (10) before the disaster deck runs out.
- **Lose `panik`** — `panicMeter >= panicMeterMax` (8).
- **Lose `korban`** — `evacuees.length + villagersStillOnBoard < targetEvacuation`.
- **Lose `waktu`** — last disaster card drawn and target not met.

Difficulty presets: `siaga` (target 8, panic 10, deck 18) · `awas` (10 / 8 / 16) · `darurat` (12 / 6 / 14).

---

## NON-NEGOTIABLES

- Reducer stays **pure**: `(state, action) => state`, no DOM, no `Math.random` outside the seeded PRNG,
  fully unit-testable.
- All UI copy goes through `lib/i18n/id.ts` (v2 switches the demo to **Bahasa Indonesia** — the docs
  and the audience are Indonesian). Card content lives in `data/`.
- Mobile-first, must work at 375px width.
- `npm run lint`, `npm test`, `npm run build` must all pass.
- Do not `git commit`. Do not take screenshots. The integrator handles build + deploy.
