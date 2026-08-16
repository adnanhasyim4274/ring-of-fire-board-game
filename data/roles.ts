// ============================================================================
// RING OF FIRE v3.0 — The six Wildlife Guardians
// One animal per real region of the Pacific Ring of Fire.
// Passive (always on) + Active (0 AP, once per round) + Sub-Mission (+2 team
// Reputation). Roles are matched by `activeKey`, never by id string.
// Source: docs/00-MASTER-SPEC-v3.md §1
// ============================================================================

import type { Role, SectorId } from "@/engine/types";

/**
 * v3 ties every Guardian to a home region and a board sector.
 * The ENGINE lane owns `Role`; this local extension carries the two new fields
 * until they land there.
 */
export interface GuardianRole extends Role {
  /** Real-world region this Guardian speaks for. */
  region: string;
  /** The board sector that region maps to. */
  sectorId: SectorId;
}

export const roles: GuardianRole[] = [
  {
    id: "sumatran_tiger",
    name: "Sumatran Tiger",
    title: "The Vanguard",
    region: "Indonesia",
    sectorId: "sunda",
    passiveName: "Strong Back",
    passive:
      "Escort up to 2 villagers at once for a single AP, instead of paying 1 AP per villager.",
    activeName: "Tactical Escort",
    active:
      "If you end a move on a tile holding villagers, gain +1 AP that may only be spent on Escort.",
    activeKey: "tactical_escort",
    subMissionName: "Frontline Rescuer",
    // This used to read "picked up directly from tiles carrying a Crisis
    // Token", which no legal sequence of actions can ever do: a Crisis Token
    // is exactly what stops villagers being led off a tile. The frontline is
    // now the region the rumour is ABOUT, which is reachable and still means
    // walking into the loudest part of the board.
    subMission:
      "Bring 5 villagers to a Ready Post out of the sector this round's News Card names.",
    subMissionKey: "rescue_crisis",
    subMissionTarget: 5,
    playstyle:
      "The team's lifting power: walk into the ugliest tile on the board and walk out with two people at once.",
  },
  {
    id: "japanese_macaque",
    name: "Japanese Macaque",
    title: "The Scholar",
    region: "Japan",
    sectorId: "hokkaido",
    passiveName: "Walking Archive",
    passive:
      "Your hand limit is 6 cards. Everyone else is capped at 4. You are the team's library.",
    activeName: "Data Mining",
    active:
      "Discard any 2 Evidence cards to open any one lock on the active News Card.",
    activeKey: "data_mining",
    subMissionName: "Epistemic Collector",
    subMission: "Hold three 3-point Evidence cards in your hand at the same time.",
    subMissionKey: "collect_3pt",
    subMissionTarget: 3,
    playstyle:
      "The patient hoarder: sits on good cards until one round can be solved outright instead of guessed at.",
  },
  {
    id: "bald_eagle",
    name: "Bald Eagle",
    title: "The Scout",
    region: "North America",
    sectorId: "cascadia",
    passiveName: "High Altitude",
    passive:
      "Immune to movement penalties from Disaster Cards, and you never pay the extra AP to enter a Cracked tile.",
    activeName: "Recon",
    active:
      "Peek at the top card of the Disaster deck OR the News deck, then put it back on top or on the bottom.",
    activeKey: "recon",
    subMissionName: "Critical Mapping",
    subMission: "End your turn on 3 different damaged tiles over the course of the game.",
    subMissionKey: "critical_mapping",
    subMissionTarget: 3,
    playstyle:
      "The team's eyes: flies ahead into the broken ground and comes back with the information that stops everyone else guessing.",
  },
  {
    id: "andean_llama",
    name: "Andean Llama",
    title: "The Grounder",
    region: "The Andes",
    sectorId: "andes",
    passiveName: "Steady Herd",
    passive:
      "Farmers really do post llamas as flock guardians: one animal that refuses to run keeps the whole herd from bolting. While you stand on a tile, no News Card can trigger an Auto-Panic effect there.",
    activeName: "Calm the Crowd",
    active:
      "Plant yourself and face the noise down. Turn up to 3 Panicked villagers on your tile Calm all at once, and pull the Crisis Token off that tile.",
    activeKey: "suppress",
    subMissionName: "Panic Damper",
    subMission: "Calm 6 Panicked villagers in total across the game.",
    subMissionKey: "calm_six",
    subMissionTarget: 6,
    playstyle:
      "The anchor: the only Guardian who can lift a Crisis Token without winning the verdict, so stand where the crowd is loudest.",
  },
  {
    id: "kea_parrot",
    name: "Kea Parrot",
    title: "The Networker",
    region: "New Zealand",
    sectorId: "south_pacific",
    passiveName: "Ground Signal",
    passive:
      "Alpine parrots that work in gangs, pick locks for fun and walk off with whatever is not bolted down. Barter Evidence with any player, no matter how far apart your tiles are.",
    activeName: "Network Sync",
    active:
      "Nose through someone's things and take what the team needs. Look at one player's entire hand, then swap one card with them.",
    activeKey: "network_sync",
    subMissionName: "Information Catalyst",
    subMission:
      "Complete 3 barters where the card you handed over cracks the News Card that same round.",
    subMissionKey: "catalyst",
    subMissionTarget: 3,
    playstyle:
      "The switchboard: knows who is holding the missing lock and gets it into the right hand before the round closes.",
  },
  {
    id: "whale_shark",
    name: "Whale Shark",
    title: "The Navigator",
    region: "The Philippines",
    sectorId: "philippine",
    passiveName: "Open Water",
    passive:
      "Sea Lane tiles cost you only 1 AP instead of 2, and you may carry a villager across with you.",
    activeName: "Deep Current",
    active:
      "Standing at a mouth of the Sea Lane, lift 1 calm villager from a neighbouring tile into the water. Standing in the water, walk 1 calm villager on your tile one hex along the lane: at the far mouth, that is safety.",
    activeKey: "open_water",
    subMissionName: "Safe Passage",
    subMission: "Bring 3 villagers across the Sea Lane and all the way to safety.",
    subMissionKey: "safe_passage",
    subMissionTarget: 3,
    playstyle:
      "The shortcut: turns a 12-tile walk around the rim into a three-hex swim, as long as the ocean stays open.",
  },
];

export const roleById: Record<string, GuardianRole> = Object.fromEntries(
  roles.map((r) => [r.id, r])
);

export const roleIds: string[] = roles.map((r) => r.id);
