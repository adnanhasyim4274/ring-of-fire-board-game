import type { TileType } from "@/engine/types";

export const tileTypes: TileType[] = [
  { id: "coast", name: "Coastal Area", vulnerableTo: ["water_coastal"] },
  { id: "slope", name: "Mountain Slope", vulnerableTo: ["volcanic"] },
  { id: "forest_slope", name: "Forest Slope", vulnerableTo: ["volcanic"] },
  { id: "city_center", name: "City Center / Residential Area", vulnerableTo: ["tectonic"] },
  { id: "fault_zone", name: "Fault Zone", vulnerableTo: ["tectonic"] },
  { id: "safe_zone", name: "Safe Zone / Assembly Point", isSafeZone: true, vulnerableTo: [] },
  { id: "ocean", name: "Pacific Ocean", vulnerableTo: [] }, // impassable board water
];

export const tileTypeById: Record<string, TileType> = Object.fromEntries(
  tileTypes.map((t) => [t.id, t])
);
