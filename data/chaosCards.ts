// ============================================================================
// RING OF FIRE v3.0 — Chaos Cards (8)
// Drawn ONLY when a verification fails (outcome "rumour_spreads").
// The setback lasts until the end of the game, or until Reputation buys it off.
// Source: docs/00-MASTER-SPEC-v3.md §4.4
// ============================================================================

import type { ChaosCard } from "@/engine/types";

export const chaosCards: ChaosCard[] = [
  {
    id: "chaos_01",
    title: "Trust Collapses",
    description:
      "One rumour got through, and now nothing the Guardians say lands the first time. Calming costs 1 extra AP for the rest of the game.",
    effectKey: "calm_cost_up_perm",
  },
  {
    id: "chaos_02",
    title: "Source Blocked: Maps Restricted",
    description:
      "Mapping and imagery services go dark \"for public order\". [WHERE] Evidence cannot be played for 2 rounds.",
    effectKey: "block_category",
    blockedCategory: "WHERE",
  },
  {
    id: "chaos_03",
    title: "Source Blocked: Archive Wiped",
    description:
      "Old news archives vanish from the servers and upload histories are scrubbed. [WHEN] Evidence cannot be played for 2 rounds.",
    effectKey: "block_category",
    blockedCategory: "WHEN",
  },
  {
    id: "chaos_04",
    title: "Source Blocked: Authority Drowned Out",
    description:
      "Official channels are buried under copycat accounts until nobody can tell which one is real. [HOW] Evidence cannot be played for 2 rounds.",
    effectKey: "block_category",
    blockedCategory: "HOW",
  },
  {
    id: "chaos_05",
    title: "Panic Exodus",
    description:
      "The rumour outruns the evacuation plan. At the start of each round, 2 villagers wander to a random neighbouring tile — often the wrong way.",
    effectKey: "villager_drift",
  },
  {
    id: "chaos_06",
    title: "Volunteer Burnout",
    description:
      "A whole night spent answering questions that should never have been asked. Every Guardian loses 1 AP each round from now on.",
    effectKey: "ap_down",
  },
  {
    id: "chaos_07",
    title: "Information Flood",
    description:
      "The family group chat detonates with contradictory forwards until nothing can be held straight. Every Guardian's hand limit drops by 1.",
    effectKey: "hand_limit_down",
  },
  {
    id: "chaos_08",
    title: "Credibility Eroded",
    description:
      "Call one true report a hoax and the team's own standing takes the hit. Every Reputation point earned from now on is docked by one before it lands.",
    effectKey: "reputation_tax",
  },
];

export const chaosCardById: Record<string, ChaosCard> = Object.fromEntries(
  chaosCards.map((c) => [c.id, c])
);

/** Every Chaos card id in canonical order. The reducer does the shuffling. */
export function buildChaosDeck(): string[] {
  return chaosCards.map((c) => c.id);
}
