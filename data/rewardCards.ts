// ============================================================================
// RING OF FIRE v2.0 — Kartu Reward / Upgrade (10 kartu)
// Dibeli dengan Poin Reputasi di Fase 5. Reputasi didapat dari verifikasi
// yang benar DAN lengkap — tebakan beruntung tidak menghasilkan apa-apa.
// Sumber: docs/00-MASTER-SPEC-v2.md §5.5
// ============================================================================

import type { RewardCard } from "@/engine/types";

export const rewardCards: RewardCard[] = [
  {
    id: "rew_peta_evakuasi",
    title: "Peta Evakuasi",
    cost: 2,
    description:
      "Jalur laut akhirnya dipetakan dan diberi pelampung penanda. Rute Laut hanya memerlukan 1 AP, bukan 2.",
    effectKey: "sea_route_cheap",
  },
  {
    id: "rew_pengeras_suara_desa",
    title: "Pengeras Suara Desa",
    cost: 2,
    description:
      "Satu corong di balai desa mengalahkan seratus pesan berantai. Biaya Menenangkan turun 1 AP.",
    effectKey: "calm_cheap",
  },
  {
    id: "rew_radio_komunitas",
    title: "Radio Komunitas",
    cost: 3,
    description:
      "Frekuensi milik warga sendiri, disiarkan dari posko, tanpa perantara. Semua pemain mendapat +1 AP permanen.",
    effectKey: "ap_up",
  },
  {
    id: "rew_dermaga_darurat",
    title: "Dermaga Darurat",
    cost: 3,
    description:
      "Ponton dan tangga besi dipasang di kedua Pos Siaga. Rute Laut hanya memerlukan 1 AP.",
    effectKey: "sea_route_cheap",
  },
  {
    id: "rew_pusat_data_warga",
    title: "Pusat Data Warga",
    cost: 3,
    description:
      "Satu papan tulis besar berisi semua yang sudah diverifikasi, terbuka untuk siapa saja. Batas kartu di tangan +2.",
    effectKey: "hand_limit_up",
  },
  {
    id: "rew_jaringan_relawan",
    title: "Jaringan Relawan",
    cost: 4,
    description:
      "Puluhan tangan tambahan ikut menyimpan dan mengedarkan bukti. Batas kartu di tangan +2 untuk semua pemain.",
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
    title: "Kampanye Klarifikasi",
    cost: 4,
    description:
      "Bantahan yang sabar, berulang, dan mudah dibagikan akhirnya menyusul hoaksnya. Tebus dan buang 1 Kartu Chaos yang sedang berlaku.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_klinik_lapangan",
    title: "Klinik Lapangan",
    cost: 5,
    description:
      "Tenda medis di simpul evakuasi memulihkan tenaga sekaligus kepercayaan. Tebus dan buang 1 Kartu Chaos yang sedang berlaku.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_drone_pemantau",
    title: "Drone Pemantau",
    cost: 5,
    description:
      "Mata di udara mengirim citra jalur setiap sepuluh menit, jadi tak ada lagi langkah yang ditebak. Semua pemain mendapat +1 AP permanen.",
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
