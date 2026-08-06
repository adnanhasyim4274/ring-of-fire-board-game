// ============================================================================
// RING OF FIRE v2.0 — Jembatan UI ke engine/rules.ts
//
// ⚠️ INTEGRATOR: ini SATU-SATUNYA berkas di lane UI yang memanggil
// `@/engine/rules`. Kalau ada tanda tangan fungsi engine yang bergeser,
// perbaikannya cukup di sini — tidak ada call site lain di components/ atau app/.
//
// Engine tetap pemegang keputusan akhir; semua di bawah ini hanya untuk
// menyorot ubin dan menampilkan label harga sebelum aksi dikirim ke reducer.
// ============================================================================

import type { GameState, Player } from "@/engine/types";
import {
  allNeighbors,
  areRimAdjacent,
  areSeaLaneLinked,
  calmCost,
  escortBlocked,
  escortCost,
  handLimit,
  isCategoryBlocked,
  isPassable,
  isSeaLaneOpen,
  maxEscortGroup,
  moveCost,
} from "@/engine/rules";

/** Apakah perpindahan a -> b memakai Rute Laut, bukan langkah rim biasa. */
export function isSeaRouteMove(state: GameState, from: number, to: number): boolean {
  if (areRimAdjacent(state, from, to)) return false;
  return areSeaLaneLinked(state, from, to);
}

export interface MoveOption {
  index: number;
  viaSeaLane: boolean;
  cost: number;
  escortCost: number;
  affordable: boolean;
  escortBlocked: boolean;
}

/**
 * Ubin yang boleh dituju pemain saat ini, lengkap dengan biaya gerak dan
 * biaya kawalnya. `allNeighbors` sudah menutup Rute Laut sendiri saat bencana
 * Oseanografi aktif, jadi daftar ini otomatis ikut menyusut.
 */
export function legalMoves(state: GameState, player: Player): MoveOption[] {
  const from = state.tiles[player.position];
  return allNeighbors(state, player.position)
    .filter((index) => isPassable(state.tiles[index]))
    .map((index) => {
      const viaSeaLane = isSeaRouteMove(state, player.position, index);
      const cost = moveCost(state, player.position, index, player, viaSeaLane);
      return {
        index,
        viaSeaLane,
        cost,
        escortCost: escortCost(state, player.position, index, player, viaSeaLane),
        affordable: player.ap >= cost,
        escortBlocked: from ? escortBlocked(state, from, state.tiles[index]) : true,
      };
    });
}

/** Berapa warga yang boleh dibawa satu aksi kawal (Harimau 2, Rute Laut selalu 1). */
export function escortGroupLimit(player: Player, viaSeaLane: boolean): number {
  return maxEscortGroup(player, viaSeaLane);
}

export {
  calmCost,
  escortCost,
  handLimit,
  isCategoryBlocked,
  isPassable,
  isSeaLaneOpen,
  moveCost,
};
