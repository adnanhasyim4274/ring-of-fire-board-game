import type { Scenario } from "@/engine/types";

// The board IS the Pacific Ring of Fire: a horseshoe of real volcanic regions
// wrapped around the Pacific Ocean (the impassable "ocean" tiles in the middle).
// West rim: Kamchatka → Japan → Philippines → Indonesia.
// South arc: Sumatra → Java → Bali → New Zealand → Tonga.
// East rim: Chile → Peru → Andes → Central America → Mexico → San Andreas → Alaska.
export const scenarios: Scenario[] = [
  {
    id: "ring_of_fire",
    name: "The Pacific Ring of Fire",
    tileCount: 35,
    cols: 7,
    rows: 5,
    layout: [
      // Row 0 — northern arc (Kamchatka → Aleutians → Alaska → the Americas)
      "slope", "fault_zone", "slope", "safe_zone", "forest_slope", "fault_zone", "city_center",
      // Row 1 — Japan (west) / Central America (east), Pacific in between
      "city_center", "ocean", "ocean", "ocean", "ocean", "ocean", "forest_slope",
      // Row 2 — Philippines (west) / Andes (east)
      "coast", "ocean", "ocean", "ocean", "ocean", "ocean", "slope",
      // Row 3 — Indonesia (west) / Peru (east)
      "coast", "ocean", "ocean", "ocean", "ocean", "ocean", "coast",
      // Row 4 — southern arc (Indonesia → New Zealand → Tonga → Chile)
      "fault_zone", "city_center", "coast", "safe_zone", "coast", "slope", "city_center",
    ],
    regionNames: [
      "Kamchatka", "Kuril Islands", "Aleutian Islands", "Alaska", "Cascadia", "San Andreas", "Mexico",
      "Japan", null, null, null, null, null, "Central America",
      "Philippines", null, null, null, null, null, "Andes",
      "Sunda Strait", null, null, null, null, null, "Peru",
      "Sumatra", "Java", "Bali", "New Zealand", "Tonga", "Atacama", "Valparaíso",
    ],
    villagerSetup: [
      1, 1, 0, 0, 1, 1, 1,
      1, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 1,
      1, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 0, 1, 0, 1,
    ], // = 15 villagers along the rim
    targetEvacuation: 8,
    totalVillagers: 15,
    disasterDeckSize: 16,
  },
];

export const scenarioById: Record<string, Scenario> = Object.fromEntries(
  scenarios.map((s) => [s.id, s])
);
