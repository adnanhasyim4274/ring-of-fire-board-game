import type { DisasterCard } from "@/engine/types";

// Section 6.3 final content. Deck = each card x2 = 16 cards (the game's timer).
export const disasterCards: DisasterCard[] = [
  {
    id: "dis_01",
    category: "water_coastal",
    title: "Tsunami Warning (Receding Tide)!",
    description: "The sea suddenly pulls back fast from the shoreline, exposing the seabed. It's a natural sign that a giant wave is about to hit!",
    affectedTileType: "Coastal Area",
    roundEffect: "Any movement leaving a Coastal Area tile requires an extra +1 AP.",
    endEffect: "One Coastal Area tile flips to its 'Swept Away' side. Any villager tokens left behind are lost.",
    roundEffectKey: "coast_exit_penalty",
    affectedTileTypeIds: ["coast"],
    destroysTile: true,
  },
  {
    id: "dis_02",
    category: "volcanic",
    title: "Volcanic Ashfall!",
    description: "The volcano begins spewing thick ash that blots out the sun. The sky darkens, breathing gets hard, and visibility is near zero.",
    affectedTileType: "All Locations",
    roundEffect: "Players need +1 extra Action Point to move between tiles.",
    endEffect: "Evacuation slows drastically, raising the risk of villagers getting trapped in the danger zone.",
    roundEffectKey: "move_penalty",
    affectedTileTypeIds: [],
    destroysTile: false,
  },
  {
    id: "dis_03",
    category: "volcanic",
    title: "Wildlife Fleeing the Mountain!",
    description: "Forest animals are seen fleeing down the slope in panicked groups. It's a natural sign of a temperature anomaly at the summit.",
    affectedTileType: "Forest Slope",
    roundEffect: "(Favorable) At the start of this round, the team may peek at the top card of the Disaster Deck.",
    endEffect: "A tactical advantage — but it confirms the major eruption is now very close.",
    roundEffectKey: "peek_disaster",
    affectedTileTypeIds: ["forest_slope"],
    destroysTile: false,
  },
  {
    id: "dis_04",
    category: "tectonic",
    title: "Ground Liquefaction!",
    description: "Earthquake shaking causes the ground beneath the city to lose its strength and turn into sucking mud!",
    affectedTileType: "Residential Area / City Center",
    roundEffect: "Escort actions through or out of City Center tiles CANNOT be performed this round. You can only calm villagers in place.",
    endEffect: "The area is completely paralyzed logistically; villagers risk being swallowed if not helped soon.",
    roundEffectKey: "block_escort",
    affectedTileTypeIds: ["city_center"],
    destroysTile: false,
  },
  {
    id: "dis_05",
    category: "tectonic",
    title: "Aftershock Swarm!",
    description: "The ground shakes violently again, without stopping! Already-cracked buildings grow more fragile, and traumatized villagers run in a panic.",
    affectedTileType: "Fault Zone",
    roundEffect: "All Villager Tokens on Fault Zone tiles and adjacent tiles automatically become Panicked.",
    endEffect: "If not calmed, the fault zone risks collapsing and claiming victims.",
    roundEffectKey: "panic_spread_fault",
    affectedTileTypeIds: ["fault_zone"],
    destroysTile: false,
  },
  {
    id: "dis_06",
    category: "social_infra",
    title: "Communications Blackout!",
    description: "Cell towers and radio cables collapse from the shaking. Internet access dies completely, and TV screens turn to static.",
    affectedTileType: "All Locations",
    roundEffect: "Players CANNOT use WHERE-category Evidence Cards (digital trail / web search) to verify this round.",
    endEffect: "The isolated region is at risk of falling for hoaxes with no way to check official news online.",
    roundEffectKey: "block_where",
    affectedTileTypeIds: [],
    destroysTile: false,
  },
  {
    id: "dis_07",
    category: "social_infra",
    title: "Total Gridlock!",
    description: "Villagers who fell for a selfish rumor try to flee using private vehicles all at once. The main road locks up solid into a giant parking lot!",
    affectedTileType: "All Locations",
    roundEffect: "The 'Trade Evidence' action (swapping cards between players) cannot be performed this round.",
    endEffect: "Teamwork to debunk hoaxes is hampered, risking a rise in the Panic Meter.",
    roundEffectKey: "block_trade",
    affectedTileTypeIds: [],
    destroysTile: false,
  },
  {
    id: "dis_08",
    category: "social_infra",
    title: "Extreme Storm!",
    description: "A rainstorm and lightning batter the islands, drowning out the Guardian Wildlife's voices against the panicked crowd.",
    affectedTileType: "All Locations",
    roundEffect: "The 'Calm the Crowd' action now costs 3 AP instead of the normal 2 AP.",
    endEffect: "Drains the Guardian Wildlife's stamina, risking villagers staying panicked through the end of the round.",
    roundEffectKey: "calm_cost_up",
    affectedTileTypeIds: [],
    destroysTile: false,
  },
];

export const disasterCardById: Record<string, DisasterCard> = Object.fromEntries(
  disasterCards.map((c) => [c.id, c])
);

/** Deck = every card duplicated to reach the scenario's deck size (default 16). */
export function buildDisasterDeck(deckSize: number): string[] {
  const ids: string[] = [];
  let i = 0;
  while (ids.length < deckSize) {
    ids.push(disasterCards[i % disasterCards.length].id);
    i++;
  }
  return ids;
}
