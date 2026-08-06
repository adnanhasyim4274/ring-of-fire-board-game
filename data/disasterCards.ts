// ============================================================================
// RING OF FIRE v3.0 — Disaster Cards (16)
// 4 per category. The deck is also the clock: when it runs out, time is up.
//
// Every card has a Round Effect (rewrites this round's rules) and a Final
// Consequence (damage applied at the end of the round).
//
// OCEANIC cards close the Sea Lane completely — the engine keys that off the
// category, so any oceanic card shuts the crossing.
//
// Source: docs/00-MASTER-SPEC-v3.md §4.3
// ============================================================================

import type { DisasterCard } from "@/engine/types";

export const disasterCards: DisasterCard[] = [
  // ——— TECTONIC ————————————————————————————————————————————————————
  {
    id: "dis_tec_01",
    category: "tectonic",
    title: "Aftershock Swarm",
    description:
      "The ground will not settle. Cracked walls that survived the first shock are giving way in the tremors that follow.",
    locationLabel: "Fault zones",
    roundEffect:
      "Every villager in the affected sector panics at the start of this round.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["cascadia", "sunda"],
    endEffect: "The fault-line tile with the most villagers takes damage.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_tec_02",
    category: "tectonic",
    title: "Ground Liquefaction",
    description:
      "Saturated soil loses its strength under sustained shaking and starts behaving like a liquid. Roads sink. Vehicles tilt where they stand.",
    locationLabel: "City districts",
    roundEffect:
      "No villager can be escorted into or out of the affected sector this round. You can still calm them where they stand.",
    roundEffectKey: "block_escort",
    affectedSectorIds: ["cascadia", "philippine"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_tec_03",
    category: "tectonic",
    title: "Megathrust Rupture",
    description:
      "An oceanic plate slips beneath a continental one along hundreds of kilometres of locked fault. The shaking lasts minutes, not seconds.",
    locationLabel: "All sectors",
    roundEffect: "Every move between tiles costs 1 extra AP.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: [],
    endEffect: "The tile holding the most villagers anywhere on the ring takes damage.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_tec_04",
    category: "tectonic",
    title: "Rockfall Cuts the Ridge Road",
    description:
      "Shaking brings a cliff face down across the only road linking two valleys, taking the relay mast with it.",
    locationLabel: "Highland passes",
    roundEffect:
      "Evidence cards cannot be discarded for movement effects this round — the alternate routes are buried.",
    roundEffectKey: "no_evidence_move",
    affectedSectorIds: ["andes"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },

  // ——— VOLCANIC ————————————————————————————————————————————————————
  {
    id: "dis_vol_01",
    category: "volcanic",
    title: "Heavy Ashfall",
    description:
      "Ash blots out the sun. Visibility drops to a few metres, every breath is grit, and the weight of it starts collapsing roofs.",
    locationLabel: "All sectors",
    roundEffect: "Every move between tiles costs 1 extra AP.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: [],
    endEffect: "The most crowded tile on the ring takes damage.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_vol_02",
    category: "volcanic",
    title: "Pyroclastic Flow",
    description:
      "A collapsing eruption column races downslope as a ground-hugging cloud of gas and rock at several hundred degrees. Nothing outruns it.",
    locationLabel: "Volcano slopes",
    roundEffect:
      "Every villager in the affected sector panics at the start of this round.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["sunda", "philippine"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_vol_03",
    category: "volcanic",
    title: "Wildlife Comes Down the Mountain",
    description:
      "Birds first, then the larger animals, moving downhill in numbers. The instruments agree with them: gas output on the summit is climbing.",
    locationLabel: "Forest slopes",
    roundEffect:
      "A favourable read: the team may look at the top card of the Disaster deck before it is drawn.",
    roundEffectKey: "peek_disaster",
    affectedSectorIds: ["south_pacific", "andes"],
    endEffect: "No tile is damaged, but the eruption is measurably closer.",
    damageTarget: "none",
  },
  {
    id: "dis_vol_04",
    category: "volcanic",
    title: "Lava Cuts the Evacuation Road",
    description:
      "A flow front crosses the main road at walking pace. It is slow, it is not survivable to cross, and it is not going to stop.",
    locationLabel: "Volcano slopes",
    roundEffect:
      "No villager can be escorted into or out of the affected sector this round.",
    roundEffectKey: "block_escort",
    affectedSectorIds: ["sunda"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },

  // ——— OCEANIC (these close the Sea Lane) ————————————————————————————
  {
    id: "dis_oce_01",
    category: "oceanic",
    title: "Tsunami Warning: Sea Withdrawing",
    description:
      "The water is pulling back off the shelf far past any low tide. The trough of the wave arrives first; the crest is behind it.",
    locationLabel: "Coastlines",
    roundEffect:
      "Leaving a coastal sector costs 1 extra AP. The Sea Lane is closed — nobody crosses open water today.",
    roundEffectKey: "coast_exit_penalty",
    affectedSectorIds: ["hokkaido", "south_pacific"],
    endEffect: "The affected sector's most crowded tile is swept and takes damage.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_oce_02",
    category: "oceanic",
    title: "Distant Tsunami Inbound",
    description:
      "A rupture on the far side of the ocean sent a wave train across it overnight. It has been travelling at the speed of a jet and it arrives on a schedule nobody can negotiate with.",
    locationLabel: "All coastlines",
    roundEffect:
      "Guardians cannot barter Evidence this round — the networks are saturated with warnings. The Sea Lane is closed.",
    roundEffectKey: "block_trade",
    affectedSectorIds: [],
    endEffect: "The most crowded tile on the ring takes damage.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_oce_03",
    category: "oceanic",
    title: "Storm Surge and Extreme Abrasion",
    description:
      "Wave after wave chews the foundations out from under the coastal road. The shoreline is not where the map says it is any more.",
    locationLabel: "Coastlines",
    roundEffect:
      "Every move between tiles costs 1 extra AP. The Sea Lane is closed.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: ["andes", "philippine"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_oce_04",
    category: "oceanic",
    title: "Submarine Eruption",
    description:
      "A volcano erupts beneath the sea. The pressure wave circles the planet and the water above the vent turns to steam and ash.",
    locationLabel: "Island arcs",
    roundEffect:
      "Every villager in the affected sector panics at the start of this round. The Sea Lane is closed.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["south_pacific", "philippine"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },

  // ——— ATMOSPHERIC ————————————————————————————————————————————————
  {
    id: "dis_atm_01",
    category: "atmospheric",
    title: "Extreme Storm",
    description:
      "Rain and thunder drown out every voice. A Guardian shouting instructions ten metres away cannot be heard at all.",
    locationLabel: "All sectors",
    roundEffect: "Calming a villager costs 3 AP instead of 2 this round.",
    roundEffectKey: "calm_cost_up",
    affectedSectorIds: [],
    endEffect: "No tile is damaged, but exhaustion carries into the next round.",
    damageTarget: "none",
  },
  {
    id: "dis_atm_02",
    category: "atmospheric",
    title: "Communications Blackout",
    description:
      "Masts are down and the cables are cut. No internet, no broadcast, no way to check anything against a source that is not standing next to you.",
    locationLabel: "All sectors",
    roundEffect:
      "WHERE-category Evidence cannot be played this round — there is no network to search on.",
    roundEffectKey: "block_where",
    affectedSectorIds: [],
    endEffect: "No tile is damaged, but the region is cut off from official news.",
    damageTarget: "none",
  },
  {
    id: "dis_atm_03",
    category: "atmospheric",
    title: "Gridlock on the Evacuation Route",
    description:
      "Everyone acted on the same rumour at the same moment and took their own vehicle. The main road is now a very long car park.",
    locationLabel: "All sectors",
    roundEffect: "Guardians cannot barter Evidence this round — nobody can reach anybody.",
    roundEffectKey: "block_trade",
    affectedSectorIds: [],
    endEffect: "No tile is damaged, but the delay compounds.",
    damageTarget: "none",
  },
  {
    id: "dis_atm_04",
    category: "atmospheric",
    title: "Whiteout Blizzard",
    description:
      "Wind-driven snow erases the horizon. Landmarks disappear, and the path you walked an hour ago is gone.",
    locationLabel: "Northern sectors",
    roundEffect: "Every move between tiles costs 1 extra AP.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: ["hokkaido", "cascadia"],
    endEffect: "The affected sector's most crowded tile takes damage.",
    damageTarget: "affected_sector",
  },
];

export const disasterCardById: Record<string, DisasterCard> = Object.fromEntries(
  disasterCards.map((c) => [c.id, c])
);

/** The deck is the game clock — `size` cards drawn from the 16, shuffled by the engine. */
export function buildDisasterDeck(size: number): string[] {
  const ids = disasterCards.map((c) => c.id);
  const out: string[] = [];
  let i = 0;
  while (out.length < size) {
    out.push(ids[i % ids.length]);
    i++;
  }
  return out;
}
