// ============================================================================
// RING OF FIRE v3.0 — Reward / Upgrade Cards (10)
// Bought with Reputation in Phase 5. Reputation only comes from verifications
// that are correct AND fully locked — a lucky guess earns nothing.
// Source: docs/00-MASTER-SPEC-v3.md §4.5
// ============================================================================

import type { RewardCard } from "@/engine/types";

export const rewardCards: RewardCard[] = [
  {
    id: "rew_peta_evakuasi",
    title: "Evacuation Chart",
    cost: 2,
    description:
      "The crossing is finally charted and buoyed. Sea Lane tiles cost 1 AP instead of 2.",
    effectKey: "sea_lane_cheap",
  },
  {
    id: "rew_pengeras_suara_desa",
    title: "Village Loudspeaker",
    cost: 2,
    description:
      "One horn on the village hall beats a hundred forwarded messages. Calming costs 1 less AP.",
    effectKey: "calm_cheap",
  },
  {
    id: "rew_radio_komunitas",
    title: "Community Radio",
    cost: 3,
    description:
      "A frequency the community owns, broadcast from the post itself, with nobody in between. Every Guardian gains +1 AP permanently.",
    effectKey: "ap_up",
  },
  {
    id: "rew_dermaga_darurat",
    title: "Emergency Jetty",
    cost: 3,
    description:
      "Pontoons and steel ladders go in at both ends of the crossing. Sea Lane tiles cost 1 AP.",
    effectKey: "sea_lane_cheap",
  },
  {
    id: "rew_pusat_data_warga",
    title: "Community Data Centre",
    cost: 3,
    description:
      "One big board listing everything already verified, readable by anyone who walks past. Hand limit +2.",
    effectKey: "hand_limit_up",
  },
  {
    id: "rew_jaringan_relawan",
    title: "Volunteer Network",
    cost: 4,
    description:
      "Dozens of extra hands to hold and circulate evidence. Hand limit +2 for every Guardian.",
    effectKey: "hand_limit_up",
  },
  {
    id: "rew_sekolah_siaga",
    title: "Sekolah Siaga Bencana",
    cost: 4,
    description:
      "Anak-anak berlatih rutin sampai jalur evakuasi jadi refleks, bukan pengumuman. Biaya Menenangkan turun 1 AP.",
    effectKey: "calm_cheap",
  },
  {
    id: "rew_kampanye_klarifikasi",
    title: "Clarification Campaign",
    cost: 4,
    description:
      "A patient, repeatable, shareable correction finally overtakes the rumour. Buy off and discard 1 active Chaos card.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_klinik_lapangan",
    title: "Field Clinic",
    cost: 5,
    description:
      "A medical tent at the evacuation node restores both strength and trust. Buy off and discard 1 active Chaos card.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_drone_pemantau",
    title: "Survey Drone",
    cost: 5,
    description:
      "An eye overhead sends route imagery every ten minutes, so nobody has to guess their next step. Every Guardian gains +1 AP permanently.",
    effectKey: "ap_up",
  },
];

export const rewardCardById: Record<string, RewardCard> = Object.fromEntries(
  rewardCards.map((c) => [c.id, c])
);

/** Kartu Reward yang mampu dibeli dengan Reputasi sekarang, termurah lebih dulu. */
export function affordableRewards(
  reputation: number,
  owned: string[] = []
): RewardCard[] {
  return rewardCards
    .filter((r) => !owned.includes(r.id) && r.cost <= reputation)
    .sort((a, b) => a.cost - b.cost);
}
