// ============================================================================
// RING OF FIRE v2.0 — Token visual bersama (warna kanonik MASTER-SPEC §2)
// Warna hex dipakai langsung di SVG; kelas Tailwind untuk panel HTML.
// ============================================================================

import type {
  DisasterCategory,
  EvidenceCategory,
  NewsCategory,
  SectorId,
  TileDamage,
  VerdictOutcome,
} from "@/engine/types";

/** Palet sektor kanonik. Selalu dipasangkan dengan isyarat non-warna. */
export const SECTOR_COLOR: Record<SectorId, string> = {
  merah: "#C4443A",
  teal: "#2E8B94",
  kuning: "#D9A441",
  biru: "#3B6FB5",
};

/** Versi gelap untuk garis tepi heksagon. */
export const SECTOR_EDGE: Record<SectorId, string> = {
  merah: "#8C2A22",
  teal: "#1B5D64",
  kuning: "#9A6D1D",
  biru: "#254B7E",
};

export const POS_SIAGA_COLOR = "#2B2F38";
export const POS_SIAGA_EDGE = "#0F1216";
export const SEA_ROUTE_COLOR = "#7B4FA8";
export const CRISIS_COLOR = "#E4572E";

/** Latar Zona Krisis — Pasifik dalam. */
export const CENTRE_COLOR = "#0B2233";

/**
 * Isyarat bentuk per sektor, digambar di dalam heksagon.
 * Wajib ada supaya sektor tidak dibedakan lewat warna saja (WCAG 1.4.1).
 */
export type SectorGlyph = "gunung" | "gelombang" | "puncak" | "pulau" | "pos";

export const SECTOR_GLYPH: Record<SectorId, SectorGlyph> = {
  merah: "gunung",
  teal: "gelombang",
  kuning: "puncak",
  biru: "pulau",
};

export const NEWS_CATEGORY_CLASS: Record<NewsCategory, string> = {
  sosial_takhayul: "bg-indigo-600",
  manipulasi_visual: "bg-fuchsia-600",
  motif_penipuan: "bg-orange-600",
  pseudosains: "bg-cyan-700",
};

export const DISASTER_CATEGORY_CLASS: Record<DisasterCategory, string> = {
  tektonik: "from-rose-800 to-red-950",
  vulkanik: "from-orange-600 to-red-900",
  oseanografi: "from-sky-700 to-blue-950",
  atmosferik: "from-slate-600 to-slate-900",
};

export const EVIDENCE_CATEGORY_CLASS: Record<EvidenceCategory, string> = {
  WHAT: "bg-sky-600",
  WHERE: "bg-teal-600",
  WHEN: "bg-amber-600",
  WHO: "bg-purple-600",
  WHY: "bg-orange-600",
  HOW: "bg-emerald-700",
};

/** Emoji ikon 5W1H sesuai MASTER-SPEC §5.2 — isyarat non-warna untuk kategori. */
export const EVIDENCE_CATEGORY_ICON: Record<EvidenceCategory, string> = {
  WHAT: "🔍",
  WHERE: "📍",
  WHEN: "🕐",
  WHO: "👤",
  WHY: "🎭",
  HOW: "🔬",
};

export const OUTCOME_CLASS: Record<
  VerdictOutcome,
  { panel: string; badge: string; text: string }
> = {
  terverifikasi: {
    panel: "border-emerald-600 bg-emerald-50",
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-900",
  },
  tebakan_beruntung: {
    panel: "border-amber-500 bg-amber-50",
    badge: "bg-amber-500 text-amber-950",
    text: "text-amber-900",
  },
  hoaks_menyebar: {
    panel: "border-red-600 bg-red-50",
    badge: "bg-red-600 text-white",
    text: "text-red-900",
  },
};

export const DAMAGE_CLASS: Record<TileDamage, string> = {
  0: "",
  1: "text-amber-700",
  2: "text-zinc-500",
};
