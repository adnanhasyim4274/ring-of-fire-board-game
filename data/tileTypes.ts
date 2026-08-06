// ============================================================================
// RING OF FIRE v3.0 — Hex tile types
// 18 land tiles + 6 Ready Posts + 3 Sea Lane tiles = 27 hexes.
// Ready Posts and Sea Lane tiles are immune to disaster damage.
// Source: docs/00-MASTER-SPEC-v3.md §2
// ============================================================================

import type { TileType } from "@/engine/types";

/**
 * v3 adds the Sea Lane, so a tile can carry two structural flags.
 * The ENGINE lane owns `TileType`; this local extension keeps the DATA lane
 * shippable while `isReadyPost` / `isSeaLane` land there (spec §9).
 */
export interface RingTileType extends TileType {
  /** Evacuation node. Villagers who reach it are Rescued. Never damaged. */
  isReadyPost?: boolean;
  /** Purple crossing through the middle of the ring. Never damaged. */
  isSeaLane?: boolean;
}

export const tileTypes: RingTileType[] = [
  {
    id: "ready_post",
    name: "Ready Post",
    isReadyPost: true,
  },
  {
    id: "sea_lane",
    name: "Sea Lane",
    isSeaLane: true,
  },
  {
    id: "coast",
    name: "Coast",
  },
  {
    id: "volcano_slope",
    name: "Volcano Slope",
  },
  {
    id: "fault_zone",
    name: "Fault Zone",
  },
  {
    id: "city",
    name: "Dense City",
  },
  {
    id: "highland",
    name: "Highland",
  },
  {
    id: "forest",
    name: "Slope Forest",
  },
];

export const tileTypeById: Record<string, RingTileType> = Object.fromEntries(
  tileTypes.map((t) => [t.id, t])
);

export const READY_POST_TYPE_ID = "ready_post";
export const SEA_LANE_TYPE_ID = "sea_lane";

/** Terrain tiles only — the 18 hexes that can hold villagers and take damage. */
export const landTileTypeIds: string[] = tileTypes
  .filter((t) => !t.isReadyPost && !t.isSeaLane)
  .map((t) => t.id);
