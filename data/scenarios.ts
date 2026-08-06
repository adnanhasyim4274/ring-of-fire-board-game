// ============================================================================
// RING OF FIRE v3.0 — The board: "THE RING"
// 24 rim hexes (6 sectors x [3 land tiles + 1 Ready Post at the node])
// + 3 Sea Lane hexes cutting straight through the hole in the middle.
// 27 tiles total.
//
//   Rim adjacency:  (i-1+24)%24 and (i+1)%24        — indices 0..23 ONLY
//   Sea Lane chain: Ready Post 0 <-> 24 <-> 25 <-> 26 <-> Ready Post 12
//
// Source: docs/00-MASTER-SPEC-v3.md §2, §7, §9
// ============================================================================

import type { Scenario, Sector, SectorId } from "@/engine/types";

/** Rim tiles only. The 3 Sea Lane tiles sit outside the ring arithmetic. */
const RING_SIZE = 24;

/** Evacuation nodes, one at each sector boundary. Immune to disaster damage. */
const READY_POST_INDICES = [0, 4, 8, 12, 16, 20];

/** The purple lane through the middle of the ring. */
const SEA_LANE_INDICES = [24, 25, 26];

/** The two opposite Ready Posts the Sea Lane joins — it skips 12 rim tiles. */
const SEA_LANE_ENDPOINTS: [number, number] = [0, 12];

/**
 * The ENGINE lane owns `Sector`; v3 adds the board colours from spec §2 so the
 * UI never has to hard-code them.
 */
export interface RingSector extends Sector {
  /** Human-readable colour name from spec §2. */
  color: string;
  /** Hex swatch used by the board renderer. */
  hex: string;
  /** The Ready Post sitting at this sector's node. */
  readyPostIndex: number;
}

const sectors: RingSector[] = [
  {
    id: "sunda",
    name: "Sunda Arc",
    region: "Java, Sumatra, Sunda Strait",
    hoaxTheme:
      "Volcanism blown out of proportion — eruptions retold as the end of the world, as in \"the next Krakatau blast will split Java in two\".",
    tileIndices: [1, 2, 3],
    readyPostIndex: 0,
    color: "Red",
    hex: "#A8322C",
  },
  {
    id: "philippine",
    name: "Philippine Arc",
    region: "Luzon, Mindanao, Taiwan",
    hoaxTheme:
      "Submarine volcanoes — AI video of a \"new island rising\", drowned-continent myths, and fake bulletins signed with the PHIVOLCS logo.",
    tileIndices: [5, 6, 7],
    readyPostIndex: 4,
    color: "Blue",
    hex: "#1565A8",
  },
  {
    id: "hokkaido",
    name: "Hokkaido Arc",
    region: "Japan, Kuril Islands, Kamchatka",
    hoaxTheme:
      "Tsunami — AI-generated \"25-metre wave\" clips and counterfeit early warnings that copy the wording and typography of JMA.",
    tileIndices: [9, 10, 11],
    readyPostIndex: 8,
    color: "Teal",
    hex: "#2E9C9C",
  },
  {
    id: "cascadia",
    name: "Cascadia Arc",
    region: "Alaska, the Aleutians, Cascadia, San Andreas",
    hoaxTheme:
      "Megathrust panic — prophecies with an exact date, doctored crack photos, and weather-weapon conspiracies built around HAARP.",
    tileIndices: [13, 14, 15],
    readyPostIndex: 12,
    color: "Green",
    hex: "#3B7A4B",
  },
  {
    id: "andes",
    name: "Andes Arc",
    region: "Peru, Chile, the Atacama",
    hoaxTheme:
      "Mountain earthquakes — recycled photos of split highways, invented death tolls, and donation drives that lead to a stranger's wallet.",
    tileIndices: [17, 18, 19],
    readyPostIndex: 16,
    color: "Ochre",
    hex: "#C08A3E",
  },
  {
    id: "south_pacific",
    name: "South Pacific Arc",
    region: "New Zealand, Tonga, Vanuatu",
    hoaxTheme:
      "Geysers and atolls — \"an island vanished overnight\", plus local superstition weaponised into instructions that contradict the evacuation plan.",
    tileIndices: [21, 22, 23],
    readyPostIndex: 20,
    color: "Magenta",
    hex: "#A63D77",
  },
];

/** Tile type id per index (0..26). 24 rim tiles, then the 3 Sea Lane tiles. */
const layout: string[] = [
  // 0 — node between South Pacific Arc and Sunda Arc
  "ready_post",
  // 1..3 — SUNDA ARC
  "fault_zone",
  "volcano_slope",
  "coast",
  // 4 — node between Sunda Arc and Philippine Arc
  "ready_post",
  // 5..7 — PHILIPPINE ARC
  "volcano_slope",
  "city",
  "highland",
  // 8 — node between Philippine Arc and Hokkaido Arc
  "ready_post",
  // 9..11 — HOKKAIDO ARC
  "coast",
  "volcano_slope",
  "fault_zone",
  // 12 — node between Hokkaido Arc and Cascadia Arc (Sea Lane endpoint)
  "ready_post",
  // 13..15 — CASCADIA ARC
  "fault_zone",
  "city",
  "volcano_slope",
  // 16 — node between Cascadia Arc and Andes Arc
  "ready_post",
  // 17..19 — ANDES ARC
  "highland",
  "coast",
  "forest",
  // 20 — node between Andes Arc and South Pacific Arc
  "ready_post",
  // 21..23 — SOUTH PACIFIC ARC
  "coast",
  "highland",
  "volcano_slope",
  // 24..26 — SEA LANE, straight through the middle of the ring
  "sea_lane",
  "sea_lane",
  "sea_lane",
];

/** Real places on the Ring of Fire, one label per tile. English throughout. */
const regionNames: string[] = [
  // 0
  "Anyer Post, Sunda Strait",
  // SUNDA ARC
  "Krakatau Strait",
  "Merapi Slope",
  "Padang Coast",
  // 4
  "Sangihe Post, Sulawesi Sea",
  // PHILIPPINE ARC
  "Mayon Slope",
  "Manila Bay",
  "Taal Caldera",
  // 8
  "Hokkaido Post, Sapporo",
  // HOKKAIDO ARC
  "Sanriku Coast",
  "Mount Fuji Slope",
  "Kuril Ridge",
  // 12
  "Unalaska Post, Aleutian Islands",
  // CASCADIA ARC
  "San Andreas Fault",
  "Seattle Basin",
  "Rainier Slope",
  // 16
  "Rapa Nui Post, South Pacific",
  // ANDES ARC
  "Atacama Desert",
  "Valparaíso Coast",
  "Andes Cloud Forest",
  // 20
  "Auckland Post, New Zealand",
  // SOUTH PACIFIC ARC
  "Tonga Trench",
  "Rotorua Geysers",
  "Ambrym Caldera",
  // SEA LANE (24..26)
  "Mariana Trench Passage",
  "Emperor Seamount Traverse",
  "Bering Approach",
];

/**
 * 18 Villager tokens on the Calm side, 3 per sector, one per land tile.
 * Never on a Ready Post — that is the destination, not the starting line —
 * and never on a Sea Lane tile, which is a crossing, not a place to live.
 */
const villagerSetup: number[] = (() => {
  const setup = new Array<number>(layout.length).fill(0);
  for (const sector of sectors) {
    for (const i of sector.tileIndices) setup[i] = 1;
  }
  return setup;
})();

export const ringOfFireScenario: Scenario = {
  id: "ring_of_fire",
  name: "The Ring",
  ringSize: RING_SIZE,
  layout,
  regionNames,
  sectors,
  readyPostIndices: READY_POST_INDICES,
  seaLaneIndices: SEA_LANE_INDICES,
  seaLaneEndpoints: SEA_LANE_ENDPOINTS,
  villagerSetup,
  totalVillagers: 18,
  targetEvacuation: 15,
  disasterDeckSize: 12,
};

export const scenarios: Scenario[] = [ringOfFireScenario];

export const scenarioById: Record<string, Scenario> = Object.fromEntries(
  scenarios.map((s) => [s.id, s])
);

export const sectorById: Record<SectorId, RingSector> = Object.fromEntries(
  sectors.map((s) => [s.id, s])
) as Record<SectorId, RingSector>;

/**
 * The sector containing a tile index, or null for a Ready Post or Sea Lane tile
 * — neither belongs to a sector.
 */
export function sectorForTileIndex(
  scenario: Scenario,
  index: number
): Sector | null {
  return scenario.sectors.find((s) => s.tileIndices.includes(index)) ?? null;
}
