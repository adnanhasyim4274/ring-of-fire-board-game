// ============================================================================
// RING OF FIRE v2.0 — Jenis ubin cincin
// 24 ubin sektor + 4 ubin Pos Siaga = 28 ubin heksagon.
// Pos Siaga kebal bencana (tidak pernah Retak/Hancur).
// ============================================================================

import type { TileType } from "@/engine/types";

export const tileTypes: TileType[] = [
  {
    id: "pos_siaga",
    name: "Pos Siaga",
    isPosSiaga: true,
  },
  {
    id: "pesisir",
    name: "Pesisir",
  },
  {
    id: "lereng_gunung",
    name: "Lereng Gunung",
  },
  {
    id: "zona_patahan",
    name: "Zona Patahan",
  },
  {
    id: "kota",
    name: "Kota Padat",
  },
  {
    id: "hutan_lereng",
    name: "Hutan Lereng",
  },
  {
    id: "dataran_tinggi",
    name: "Dataran Tinggi",
  },
];

export const tileTypeById: Record<string, TileType> = Object.fromEntries(
  tileTypes.map((t) => [t.id, t])
);

export const POS_SIAGA_TYPE_ID = "pos_siaga";
