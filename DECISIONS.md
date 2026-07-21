# Ring of Fire Board Game — Design Decisions & Assumptions Log

## [Rename] — "Cluecano" → "Ring of Fire Board Game"
Context: Team decided the public title should be "Ring of Fire Board Game", not "Cluecano".
Decision: All player-facing branding (title, tab title, home/how-to-play copy) now reads "Ring of Fire Board Game". Internal identifiers stayed stable except the localStorage key (bumped to `ring-of-fire-game-v1`) and package name.
Reasoning: The map redesign invalidated old saves anyway, so bumping the persist key is a clean break.

## [Map] — The board IS the Pacific Ring of Fire
Context: Team asked for a map that looks like the real Ring of Fire, with tiles matching real regions.
Decision: 7×5 grid (35 cells) shaped as a horseshoe of land tiles around a block of impassable `ocean` tiles (the Pacific). Each land tile carries a real region label (Japan, Philippines, Sunda Strait, Sumatra, Java, Bali, New Zealand, Tonga, Chile/Valparaíso, Peru, Andes, Central America, Mexico, San Andreas, Cascadia, Alaska, Aleutians, Kuril Islands, Kamchatka). Two Safe Zones (Alaska in the north, New Zealand in the south). 15 villagers seeded along the rim; target 8.
Decision: Added an `ocean` tile type + `isPassable()` helper. Ocean tiles render as decorative water, are never selectable, and are excluded from movement, escort, BFS pathing, and tile-destruction targeting.
Reasoning: A ring-shaped board makes the theme legible at a glance and keeps evacuation routes along a coherent coastal arc, exactly the Ring-of-Fire fantasy.


## [Chunk 0] — npm instead of pnpm
Context: Spec prefers pnpm, npm as fallback.
Decision: Use npm.
Reasoning: pnpm is not installed on the build machine; npm 11 is. Spec explicitly allows the fallback.

## [Chunk A] — evt_03 "WHEN" lock folded into HOW
Context: `evt_03` references a WHEN evidence category that doesn't exist in the 5-category evidence list.
Decision: `evt_03.requiredLocks = ["HOW", "WHY"]` — checking a photo's original timestamp counts as forensic verification (HOW).
Reasoning: The spec's builder note offers exactly this option; it avoids a 6th category that would exist for one card.

## [Chunk B] — OR-lock semantics: one matching card resolves the event
Context: 5.3 says "all required locks opened", 6.1 says requiredLocks is an OR — one is enough.
Decision: `requiredLocks` is an OR list. Playing one evidence card matching any listed category (or the HOW wildcard) immediately resolves the event.
Reasoning: 6.1 is the per-card source of truth and every seeded card reads naturally as OR ("Check X OR Check Y").

## [Chunk A] — Eagle vs Orangutan differentiation
Context: Both roles "peek at a deck"; spec suggests differentiating.
Decision: Eagle peeks the top of the **Disaster deck**; Orangutan peeks the top of the **Event deck**. Eagle's alternative "draw 1 extra evidence" option was dropped to keep the ability single-purpose.
Reasoning: Exactly the split the spec's builder note recommends.

## [Chunk B] — Tiger's +1 escort AP implemented as a per-round escort discount
Context: "+1 AP specifically for evacuation actions" can't be a plain +1 AP (it would be spendable on anything).
Decision: Tiger's first Escort action each round costs 1 less AP (minimum 0).
Reasoning: Economically identical to +1 escort-only AP (escort base cost is 1) without needing a second AP pool.

## [Chunk B] — Escort requires a calm villager; escort moves player + villager together
Context: Spec doesn't state whether panicked villagers can be escorted, or whether the player moves too.
Decision: Only calm (status `normal`) villagers can be escorted; the player moves along with the villager to the target tile.
Reasoning: "Calm first, then evacuate" is the intended core loop tension; physically escorting means walking together.

## [Chunk B] — Timeout = last disaster card drawn and target unmet
Context: 5.4 says "runs out = game over"; 5.6 says "once its last card is drawn and the target hasn't been met".
Decision: After resolving the disaster draw in Phase 4, if the deck is now empty and evacuation target is unmet → timeout loss. Deck size (16) = max number of rounds.
Reasoning: Matches the "last card drawn" wording; the win check runs first, so winning on the final round still counts.

## [Chunk A/B] — Only dis_01 destroys tiles in the MVP
Context: Several disaster cards have narrative end-effects ("will collapse next phase") without a concrete rule.
Decision: `dis_01` (Tsunami) flips one Coastal tile to Destroyed and claims villagers left there. Other cards' end effects are narrative/log-only; their round effects are fully mechanical.
Reasoning: One concrete tile-destruction path keeps the casualty lose-condition real without inventing conditional rules the spec doesn't define. Easy to extend later.

## [Chunk B] — Panic Meter +1 on every ignored event
Context: 5.4 says +1 "every time an event is ignored", but evt_04/evt_05's effect text doesn't mention the meter.
Decision: Every ignored/failed event adds +1 panic (blockable by Mental Fortitude), plus the card's specific extra effect.
Reasoning: 5.4 is the general rule; card text lists extras, not replacements.

## [Chunk A] — 2-point bonus generalization for added cards
Context: Spec gives point-bonuses only for the seeded WHERE (AP refund) and WHO (auto-calm) cards.
Decision: All 2-point cards grant a bonus: WHO-category → auto-calm nearest panicked villager; every other category → refund 1 AP. 1-point cards have no bonus; the 3-point card is the wildcard.
Reasoning: Keeps points meaningful and consistent across the expanded deck.

## [Chunk B] — evt_04 "Permanently Panicked" implementation
Context: Villagers "refuse to evacuate until verified", but the verification window is over once ignored.
Decision: The tile gets a `permanentPanic` flag: the normal Calm action is blocked there. Komodo's ability and "free calm" evidence effects (e.g. Loudspeaker) still work and clear the flag/crisis token.
Reasoning: Preserves the punishment while leaving counterplay, so the tile isn't a permanent dead zone.

## [Chunk B] — evt_05 (fact) ignored = coastal villagers panic
Context: Spec says implement as "increased risk, not an instant game over".
Decision: Ignoring evt_05 panics the villagers on the target Coastal tile (they stay on the beach, harder to rescue before a tsunami card lands).
Reasoning: Concrete, simple risk increase that synergizes with dis_01's coastal destruction.

## [Chunk B] — Players standing on a destroyed tile relocate
Decision: A player on a tile flipped to Destroyed moves to the first adjacent normal tile (fallback: the safe zone). Guardians are never casualties.
Reasoning: Player elimination isn't in the spec; only villager tokens can be lost.

## [Chunk B] — Determinism & purity boundaries
Decision: The reducer is pure given a `seed` carried in START_GAME (mulberry32 PRNG for shuffles). The store injects `Date.now()`-based seed at dispatch time. Log timestamps use `Date.now()` (not compared in tests).
Reasoning: Keeps the engine unit-testable and multiplayer-portable while allowing real randomness in play.

## [Chunk B] — Resource discards allowed in Phases 2–3; early AP gains become pending
Decision: Evidence cards can be discarded for resources during Phase 2 or Phase 3. AP gains earned before Phase 3 are stored as a pending bonus applied at the Phase 3 AP reset (base 3 + bonuses − Monkey penalty, min 0).
Reasoning: AP only exists as a spendable pool in Phase 3; pending bonuses avoid AP appearing then being wiped by the reset.

## [Chunk B] — Trade ("Logistics Assist") payload
Context: The generic DISCARD action can't express a swap.
Decision: The discard action carries optional `tradeWithPlayerId` + `tradeGiveCardId`; the initiating player receives the target's first card. Blocked while Total Gridlock (dis_07) is active.
Reasoning: Deterministic, minimal UI; "you don't get to pick what you receive" is fine flavor for a crisis.

## [Chunk A] — Deck compositions
Decision: Event deck = 10 unique cards (5 from spec + 5 new, reshuffles its discard if exhausted). Evidence deck = 25 unique cards × 2 copies = 50 (reshuffles discard). Disaster deck = 8 unique × 2 = 16, no reshuffle (it's the game timer).
Reasoning: Matches spec-recommended sizes (10–15 events, 40–50 evidence, 15–20 disasters).

## [Chunk B] — Monkey's bonus draw
Decision: At each round start Monkey draws 1 extra evidence card, taking the first WHY or WHO card found in the deck (top card if none).
Reasoning: Implements "extra evidence related to WHY/WHO" deterministically.

## [Chunk F] — Game Over as a modal within /play
Decision: No separate `/game-over` route; a full-screen modal over the board shows win/lose, reason, and stats.
Reasoning: Spec explicitly allows this; keeps final board state visible behind the result.

## [Chunk K] — Deployment
Context: Spec asks for an actual Vercel deploy.
Decision: The project is verified deploy-ready (`next build` clean, no custom server, no required env vars). The actual GitHub push + Vercel import needs the team's own accounts/credentials, which this build environment doesn't have — step-by-step instructions are in README.md.
