// ============================================================================
// RING OF FIRE v2.0 — Kartu Peran Satwa Penjaga (5)
// Pasif (selalu aktif) + Aktif (0 AP, 1x per ronde) + Sub-Misi (+2 Reputasi tim).
// Sumber: docs/00-MASTER-SPEC-v2.md §4
// ============================================================================

import type { Role } from "@/engine/types";

export const roles: Role[] = [
  {
    id: "elang",
    name: "Elang",
    title: "The Scout",
    passiveName: "Navigasi Udara",
    passive:
      "Kebal penalti gerak dari Kartu Bencana, dan tidak membayar AP ekstra untuk masuk atau keluar ubin Retak maupun Hancur.",
    activeName: "Reconnaissance",
    active:
      "Intip 1 kartu teratas dek Bencana ATAU dek Berita, lalu kembalikan ke atas atau taruh di bawah dek.",
    activeKey: "recon",
    subMissionName: "Pemetaan Kritis",
    subMission:
      "Akhiri giliranmu di 3 ubin Retak/Hancur yang berbeda sepanjang permainan.",
    subMissionKey: "map_damaged",
    subMissionTarget: 3,
    playstyle:
      "Mata tim: terbang duluan ke daerah rusak, pulang membawa informasi sebelum orang lain rugi menebak.",
  },
  {
    id: "orangutan",
    name: "Orangutan",
    title: "The Scholar",
    passiveName: "Arsip Berjalan",
    passive:
      "Batas kartu di tanganmu 6, sementara pemain lain hanya 4. Kamu adalah perpustakaan berjalan tim.",
    activeName: "Data Mining",
    active:
      "Buang 2 Kartu Evidence apa saja untuk membuka 1 gembok apa pun di Kartu Berita aktif.",
    activeKey: "data_mining",
    subMissionName: "Kolektor Epistemologi",
    subMission: "Pegang 3 Kartu Evidence bernilai 3 poin sekaligus di tanganmu.",
    subMissionKey: "collect_3pt",
    subMissionTarget: 3,
    playstyle:
      "Penimbun bukti yang sabar: menahan kartu bagus sampai satu ronde bisa dituntaskan sekaligus.",
  },
  {
    id: "harimau",
    name: "Harimau",
    title: "The Vanguard",
    passiveName: "Fisik Superior",
    passive:
      "Bisa mengawal 2 Token Warga sekaligus dengan biaya 1 AP, bukan 1 warga per AP.",
    activeName: "Tactical Escort",
    active:
      "Jika kamu mengakhiri gerakan di ubin yang berisi warga, dapatkan +1 AP yang hanya boleh dipakai untuk aksi Evakuasi.",
    activeKey: "tactical_escort",
    subMissionName: "Penyelamat Garis Depan",
    subMission:
      "Evakuasi total 5 warga yang kamu ambil langsung dari ubin ber-Token Krisis.",
    subMissionKey: "rescue_crisis",
    subMissionTarget: 5,
    playstyle:
      "Tenaga angkut tim: masuk ke ubin paling berbahaya, keluar membawa dua warga sekali jalan.",
  },
  {
    id: "monyet",
    name: "Monyet",
    title: "The Networker",
    passiveName: "Sinyal Repeater",
    passive:
      "Boleh Barter Bukti dengan pemain mana pun tanpa harus berada di ubin yang sama.",
    activeName: "Sinkronisasi Jaringan",
    active:
      "Lihat seluruh isi tangan 1 pemain, lalu tukar 1 kartu dengannya.",
    activeKey: "network_sync",
    subMissionName: "Katalisator Informasi",
    subMission:
      "Lakukan 3 barter yang kartunya langsung dipakai memecahkan Kartu Berita di ronde yang sama.",
    subMissionKey: "catalyst",
    subMissionTarget: 3,
    playstyle:
      "Penyambung jaringan: tahu siapa memegang kunci yang hilang, dan mengantarkannya tepat waktu.",
  },
  {
    id: "komodo",
    name: "Komodo",
    title: "The Grounder",
    passiveName: "Aura Otoritas",
    passive:
      "Selama kamu berada di sebuah ubin, Kartu Berita tidak bisa memicu efek \"Otomatis Panik\" di ubin itu.",
    activeName: "Menekan Histeria",
    active:
      "Ubah hingga 3 Warga Panik di ubinmu menjadi Tenang serentak (biaya normal: 2 AP per 1 warga).",
    activeKey: "suppress",
    subMissionName: "Peredam Histeria",
    subMission: "Tenangkan total 6 Warga Panik sepanjang permainan.",
    subMissionKey: "calm_six",
    subMissionTarget: 6,
    playstyle:
      "Jangkar tim: berdiri di titik terpanas dan menahan kepanikan supaya yang lain sempat berpikir.",
  },
];

export const roleById: Record<string, Role> = Object.fromEntries(
  roles.map((r) => [r.id, r])
);

export const roleIds: string[] = roles.map((r) => r.id);
