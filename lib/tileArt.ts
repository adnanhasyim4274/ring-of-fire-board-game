// ============================================================================
// RING OF FIRE v3.0 — which printed tile painting goes on which hex.
//
// The illustrator delivered FIVE tile paintings (desert, island, sea, snow,
// volcano) for SIX sectors plus the Sea Lane, so the mapping cannot be one
// painting per sector: it is by the real-world terrain each hex stands for.
// ============================================================================

import { ART } from "@/data/artManifest";
import type { SectorId, TileState } from "@/engine/types";
import { HEX_RADIUS } from "@/lib/ring";

/** The five tile paintings in `public/art/tile`. */
export type TileArtId = "desert" | "island" | "sea" | "snow" | "volcano";

/** Every hex on the board that needs a painting: the six sectors, the Ready
 *  Posts (no sector of their own) and the Sea Lane. */
export type TileArtKey = SectorId | "ready_post" | "sea_lane";

/**
 * Terrain of the region each hex represents. Where a sector could take two
 * paintings the tie is broken towards variety, so all five appear on the ring:
 * Cascadia takes `volcano` (the Cascade cones) rather than a second `snow`, and
 * Andes takes `desert` (the Atacama) rather than a third `volcano`.
 */
export const TILE_ART: Record<TileArtKey, TileArtId> = {
  sunda: "island", // Java, Sumatra, the Sunda Strait: tropical volcanic islands
  philippine: "island", // Luzon, Mindanao, Taiwan: a tropical archipelago
  hokkaido: "snow", // Japan, the Kurils, Kamchatka: snowbound northern coast
  cascadia: "volcano", // Rainier and the Cascade volcanic arc up to the Aleutians
  andes: "desert", // Peru, Chile and the Atacama: the driest desert on Earth
  south_pacific: "island", // New Zealand, Tonga, Vanuatu: volcanic islands and atolls
  ready_post: "island", // harbour towns on solid ground: Anyer, Rapa Nui, Unalaska
  sea_lane: "sea", // open water: the only tiles that are not land at all
};

/** The painting key for a tile. Mirrors the colour/glyph chains in the theme. */
export function tileArtKey(tile: TileState): TileArtKey {
  if (tile.isSeaLane) return "sea_lane";
  if (tile.isReadyPost || !tile.sectorId) return "ready_post";
  return tile.sectorId;
}

/**
 * The painting for a tile in its current state. Damage 2 (Hancur) swaps to the
 * `destroyed` variant; damage 1 (Retak) keeps the intact art and is shown by
 * the crack overlay, which is how the printed game does it too.
 */
export function tileArtworkSrc(tile: TileState): string {
  const art = ART.tile[TILE_ART[tileArtKey(tile)]];
  return tile.damage === 2 ? art.destroyed : art.normal;
}

/**
 * Each painting is a hexagon with its own printed border, and every hex on the
 * ring is rotated to face the centre, so that border can never line up with the
 * tile outline. Drawing the art oversized and clipping it to the tile shows only
 * the painted interior. 1.3 is the smallest zoom at which the opaque part of
 * every file still covers the whole hexagon.
 */
export const TILE_ART_ZOOM = 1.3;

/** Side of the square box the painting is drawn into, in SVG viewBox units. */
export const TILE_ART_BOX = HEX_RADIUS * 2 * TILE_ART_ZOOM;

/**
 * How much of the flat sector colour is washed back over the painting. The
 * colour is a rules cue (MASTER-SPEC §2) and the white Villager, Crisis and
 * number overlays need the contrast, so the art is tinted rather than bare.
 */
export const TILE_ART_WASH = 0.42;
