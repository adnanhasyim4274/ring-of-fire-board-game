// ============================================================================
// RING OF FIRE v3.0 — shared visual tokens (canonical colours, MASTER-SPEC v3 §2)
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
  sunda: "#A8322C",
  philippine: "#1565A8",
  hokkaido: "#2E9C9C",
  cascadia: "#3B7A4B",
  andes: "#C08A3E",
  south_pacific: "#A63D77",
};

/** Versi gelap untuk garis tepi heksagon. */
export const SECTOR_EDGE: Record<SectorId, string> = {
  sunda: "#71201C",
  philippine: "#0E4373",
  hokkaido: "#1D6868",
  cascadia: "#265030",
  andes: "#8A6029",
  south_pacific: "#732852",
};

export const READY_POST_COLOR = "#2B2F38";
export const READY_POST_EDGE = "#0F1216";
export const SEA_LANE_COLOR = "#7B4FA8";
export const SEA_LANE_EDGE = "#553575";
export const CRISIS_COLOR = "#E4572E";

/** Latar Zona Krisis — Pasifik dalam. */
export const CENTRE_COLOR = "#0B2233";

/**
 * Isyarat bentuk per sektor, digambar di dalam heksagon.
 * Wajib ada supaya sektor tidak dibedakan lewat warna saja (WCAG 1.4.1).
 */
export type SectorGlyph =
  | "volcano"
  | "wave"
  | "peaks"
  | "island"
  | "pine"
  | "geyser"
  | "post"
  | "lane";

export const SECTOR_GLYPH: Record<SectorId, SectorGlyph> = {
  sunda: "volcano",
  philippine: "island",
  hokkaido: "wave",
  cascadia: "pine",
  andes: "peaks",
  south_pacific: "geyser",
};

export const NEWS_CATEGORY_CLASS: Record<NewsCategory, string> = {
  social_superstition: "bg-indigo-600",
  visual_manipulation: "bg-fuchsia-600",
  fraud_motive: "bg-orange-600",
  pseudoscience: "bg-cyan-700",
};

export const DISASTER_CATEGORY_CLASS: Record<DisasterCategory, string> = {
  tectonic: "from-rose-800 to-red-950",
  volcanic: "from-orange-600 to-red-900",
  oceanic: "from-sky-700 to-blue-950",
  atmospheric: "from-slate-600 to-slate-900",
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
  verified: {
    panel: "border-emerald-600 bg-emerald-50",
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-900",
  },
  lucky_guess: {
    panel: "border-amber-500 bg-amber-50",
    badge: "bg-amber-500 text-amber-950",
    text: "text-amber-900",
  },
  rumour_spreads: {
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
