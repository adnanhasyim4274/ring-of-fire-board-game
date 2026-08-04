// ============================================================================
// RING OF FIRE v2.0 — Kartu Chaos (8 kartu)
// Ditarik HANYA saat verifikasi gagal (outcome "hoaks_menyebar").
// Kerugian berlaku sampai akhir permainan atau sampai ditebus dengan Reputasi.
// Sumber: docs/00-MASTER-SPEC-v2.md §5.4
// ============================================================================

import type { ChaosCard } from "@/engine/types";

export const chaosCards: ChaosCard[] = [
  {
    id: "chaos_01",
    title: "Kepercayaan Runtuh",
    description:
      "Satu hoaks yang dibiarkan lolos membuat warga berhenti percaya pada Satwa Penjaga. Sekarang setiap kalimat menenangkan harus diulang dua kali. Biaya Menenangkan +1 AP secara permanen.",
    effectKey: "calm_cost_up_perm",
  },
  {
    id: "chaos_02",
    title: "Sumber Diblokir: Peta Ditutup",
    description:
      "Layanan peta dan citra wilayah tiba-tiba dibatasi \"demi ketertiban\". Kartu Evidence kategori [WHERE] tidak bisa dimainkan selama 2 ronde.",
    effectKey: "block_category",
    blockedCategory: "WHERE",
  },
  {
    id: "chaos_03",
    title: "Sumber Diblokir: Arsip Hilang",
    description:
      "Arsip berita lama dihapus dari server dan riwayat unggahan dibersihkan. Kartu Evidence kategori [WHEN] tidak bisa dimainkan selama 2 ronde.",
    effectKey: "block_category",
    blockedCategory: "WHEN",
  },
  {
    id: "chaos_04",
    title: "Sumber Diblokir: Otoritas Dibungkam",
    description:
      "Kanal resmi kebanjiran akun tiruan sampai warga tidak tahu lagi mana yang asli. Kartu Evidence kategori [HOW] tidak bisa dimainkan selama 2 ronde.",
    effectKey: "block_category",
    blockedCategory: "HOW",
  },
  {
    id: "chaos_05",
    title: "Eksodus Panik",
    description:
      "Kabar palsu menyebar lebih cepat daripada rencana evakuasi. Pada awal tiap ronde, 2 warga bergerak ke ubin bersebelahan secara acak — sering ke arah yang salah.",
    effectKey: "villager_drift",
  },
  {
    id: "chaos_06",
    title: "Kelelahan Relawan",
    description:
      "Semalaman meladeni pertanyaan yang seharusnya tidak pernah muncul. Semua pemain kehilangan 1 AP pada tiap ronde berikutnya.",
    effectKey: "ap_down",
  },
  {
    id: "chaos_07",
    title: "Banjir Informasi",
    description:
      "Grup keluarga meledak oleh kiriman yang saling bertentangan sampai tidak ada yang bisa disimpan dengan tenang. Batas kartu di tangan berkurang 1 untuk semua pemain.",
    effectKey: "hand_limit_down",
  },
  {
    id: "chaos_08",
    title: "Kredibilitas Tergerus",
    description:
      "Sekali salah menuduh berita benar sebagai hoaks, reputasi tim ikut terbawa. Setiap Poin Reputasi yang diperoleh berikutnya dipotong satu sebelum masuk jalur.",
    effectKey: "reputation_tax",
  },
];

export const chaosCardById: Record<string, ChaosCard> = Object.fromEntries(
  chaosCards.map((c) => [c.id, c])
);

/** Semua id Kartu Chaos, urutan kanonik. Reducer yang mengocok. */
export function buildChaosDeck(): string[] {
  return chaosCards.map((c) => c.id);
}
