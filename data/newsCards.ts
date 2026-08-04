// ============================================================================
// RING OF FIRE v2.0 — Kartu Berita (16 kartu, 4 kategori x 4)
// DEPAN: kategori, judul, isi postingan, konten terlampir, sektor target, 2 gembok.
// BELAKANG: STATUS ASLI, penjelasan ilmiah, tanda bahaya, efek Diabaikan/Divalidasi.
//
// PENTING: tidak semua berita hoaks. 5 dari 16 kartu berstatus FAKTA.
// Literasi bukan "curiga pada semua hal", tapi MEMVERIFIKASI.
// Sumber: docs/00-MASTER-SPEC-v2.md §5.1
// ============================================================================

import type { NewsCard, NewsCategory } from "@/engine/types";

export const newsCards: NewsCard[] = [
  // ——————————————————————————————————————————————————————————————————
  // SOSIAL / TAKHAYUL
  // ——————————————————————————————————————————————————————————————————
  {
    id: "news_st_01",
    category: "sosial_takhayul",
    title: "Thread Viral: Migrasi Gagak Pertanda Kiamat!",
    body:
      "UTAS. Sejak subuh tadi ribuan gagak terbang meninggalkan lereng ke arah selatan. Nenek saya bilang ini pertanda yang sama persis seperti 1883 sebelum Krakatau meledak. Hitungan leluhur: 3 hari lagi. TOLONG SEBARKAN sebelum akun ini dibungkam. 🕯️🖤",
    attachedContent:
      "Foto langit senja penuh siluet burung, kontrasnya dinaikkan sampai gelap dramatis. Tanpa keterangan lokasi maupun tanggal.",
    targetSectorId: "merah",
    truth: "hoax",
    locks: ["HOW", "WHEN"],
    explanation:
      "Burung memang peka terhadap getaran dan gas dari tanah, tetapi kepekaan itu tidak pernah bisa diterjemahkan menjadi tanggal. Tidak ada satu pun metode ilmiah di dunia yang mampu memastikan hari sebuah letusan atau gempa terjadi. Migrasi gagak mengikuti musim dan sumber makanan, dan foto ini sudah beredar bertahun-tahun sebelum krisis sekarang.",
    redFlags:
      "Ramalan dengan tanggal pasti (\"3 hari lagi\"), otoritas ditumpangkan pada leluhur alih-alih lembaga, klaim \"akun ini akan dibungkam\", dan foto tanpa waktu maupun lokasi.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { apBonus: 1, removeCrisisToken: true },
  },
  {
    id: "news_st_02",
    category: "sosial_takhayul",
    title: "Kultus Rahasia & Amarah Dewa Bumi",
    body:
      "Ada alasan kenapa tanah di sepanjang Andes tidak berhenti bergetar. Sekelompok orang menggelar ritual terlarang di ketinggian dan membangunkan sesuatu yang seharusnya tidur. Penduduk lokal sudah tahu. Pemerintah memilih diam. Jangan evakuasi ke utara — arah itu yang mereka inginkan.",
    attachedContent:
      "Video 12 detik gelap bergoyang: lingkaran obor di punggung bukit, suara nyanyian yang jelas ditambahkan dari trek audio lain.",
    targetSectorId: "kuning",
    truth: "hoax",
    locks: ["HOW", "WHO"],
    explanation:
      "Getaran di sepanjang Andes berasal dari tumbukan Lempeng Nazca yang menunjam di bawah Lempeng Amerika Selatan — proses yang berjalan jutaan tahun dan terekam seismograf setiap hari. Tidak ada ritual manusia yang bisa memindahkan lempeng tektonik seberat itu. Akun penyebarnya tidak menyebut satu pun nama saksi yang bisa dihubungi.",
    redFlags:
      "Musuh tak bernama (\"sekelompok orang\", \"mereka\"), tuduhan pemerintah menutupi tanpa bukti, dan yang paling berbahaya: instruksi menghindari arah evakuasi resmi.",
    ifIgnored: { panic: 1, lockEvacuationSector: true },
    ifValidated: { removeCrisisToken: true, calmTargetSector: true },
  },
  {
    id: "news_st_03",
    category: "sosial_takhayul",
    title: "Konspirasi Elit Global: Senjata Badai HAARP!",
    body:
      "Bandingkan sendiri. Badai ini berbelok 90 derajat persis di atas jalur evakuasi. Alam tidak bekerja dengan penggaris. Ini senjata cuaca, dan kita sedang jadi kelinci percobaan. Cari sendiri \"HAARP\" sebelum hasilnya dihapus.",
    attachedContent:
      "Tangkapan layar citra radar dengan garis merah dan lingkaran digambar tangan, ditempel berdampingan dengan foto antena ilmiah di padang salju.",
    targetSectorId: "kuning",
    truth: "hoax",
    locks: ["WHY", "WHERE"],
    explanation:
      "HAARP adalah fasilitas riset ionosfer di Alaska yang datanya terbuka untuk publik; dayanya jauh lebih kecil daripada satu petir biasa, apalagi sebuah badai. Badai berbelok karena arus jet dan perbedaan tekanan udara, dan belokan itu diprediksi model cuaca berhari-hari sebelumnya. Foto antena yang dilampirkan diambil bertahun-tahun lalu di lokasi yang sama sekali berbeda dari badai ini.",
    redFlags:
      "Dua gambar tak berhubungan disandingkan seolah saling membuktikan, coretan manual sebagai \"analisis\", dan ajakan \"cari sendiri sebelum dihapus\" yang memindahkan beban bukti ke pembaca.",
    ifIgnored: { panic: 2 },
    ifValidated: { calmTargetSector: true, drawEvidence: 1 },
  },
  {
    id: "news_st_04",
    category: "sosial_takhayul",
    title: "Satwa Turun Gunung, Warga Lereng Mulai Mengungsi",
    body:
      "Sejak dua hari lalu monyet dan babi hutan turun sampai ke kebun warga di lereng — kejadian yang biasanya tidak pernah sampai sedekat ini. Petugas pos pengamatan membenarkan aktivitas gunung memang sedang naik dan meminta warga radius bahaya bersiap. Bukan mistis. Ini sinyal.",
    attachedContent:
      "Video 40 detik siang hari: sekelompok monyet melintasi kebun warga, terdengar suara perekam menyebut nama desa dan tanggal.",
    targetSectorId: "merah",
    truth: "fakta",
    locks: ["WHO", "HOW"],
    explanation:
      "Ketika aktivitas vulkanik meningkat, tanah di lereng memanas dan gas seperti sulfur dioksida serta karbon dioksida keluar lebih deras, sehingga satwa liar menjauh dari puncak. Petugas pos pengamatan gunung api mencatat perilaku satwa sebagai indikator pendukung, bukan sebagai ramalan tanggal. Yang membuat kabar ini sahih bukan satwanya, melainkan konfirmasi dari pos pengamatan resmi yang bisa dicek namanya.",
    redFlags:
      "Justru tidak ada. Kabar ini menyebut lembaga yang bisa dihubungi, videonya memuat lokasi dan tanggal, dan bahasanya mengajak bersiap — bukan mengancam. Curiga pada semua hal juga bentuk kegagalan literasi.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { stepTowardPosSiaga: true, removeCrisisToken: true },
  },

  // ——————————————————————————————————————————————————————————————————
  // MANIPULASI VISUAL
  // ——————————————————————————————————————————————————————————————————
  {
    id: "news_mv_01",
    category: "manipulasi_visual",
    title: "Deepfake Peringatan Dini: \"Evakuasi Sekarang Juga!\"",
    body:
      "PERNYATAAN RESMI. Kepala lembaga meteorologi meminta seluruh warga pesisir bergerak ke dataran tinggi dalam 20 menit ke depan. Rekaman lengkap di bawah. Sebarkan ke grup keluarga sekarang!!",
    attachedContent:
      "Video 30 detik seorang pejabat berseragam membacakan peringatan. Gerak bibir sedikit meleset dari suara, dan tepi rahangnya berkedip tiap kali kepala menoleh.",
    targetSectorId: "teal",
    truth: "hoax",
    locks: ["WHAT", "WHO"],
    explanation:
      "Wajah pada video ini ditempelkan perangkat lunak sintesis: sinkronisasi bibir dan tepi rahang adalah dua hal yang paling sulit dipalsukan, dan keduanya gagal di sini. Peringatan dini sungguhan selalu keluar bersamaan di beberapa kanal resmi — situs lembaga, aplikasi, sirene, dan radio — bukan hanya sebagai satu video kiriman ulang. Satu sumber tunggal untuk perintah sepenting evakuasi adalah tanda bahaya, bukan bukti.",
    redFlags:
      "Tenggat waktu yang mustahil (\"20 menit\"), video beredar tanpa tautan ke kanal resmi mana pun, artefak di tepi wajah, dan desakan menyebarkan sebelum memeriksa.",
    ifIgnored: { panic: 1, panicTargetSector: true, apPenaltyFirstPlayer: 1 },
    ifValidated: { calmTargetSector: true, drawEvidence: 1 },
  },
  {
    id: "news_mv_02",
    category: "manipulasi_visual",
    title: "Foto Satelit Bocor: Retakan Raksasa di Dasar Laut",
    body:
      "Seorang kenalan di bagian pemetaan mengirim ini sebelum dihapus dari server. Retakan sepanjang 400 km terbuka di dasar laut, tepat di bawah jalur kapal evakuasi kita. Mereka tidak akan mengumumkannya. Simpan gambarnya sebelum hilang.",
    attachedContent:
      "Citra satelit biru gelap dengan garis retakan menganga terang. Bayangan di dalam retakan jatuh berlawanan arah dengan bayangan pulau di sisi kanan gambar.",
    targetSectorId: "biru",
    truth: "hoax",
    locks: ["WHAT", "WHERE"],
    explanation:
      "Citra satelit optik tidak dapat menembus air laut sampai ke dasar samudra; peta dasar laut dibuat dengan sonar dari kapal, bukan dari foto. Arah bayangan di dalam \"retakan\" berlawanan dengan bayangan pulau di gambar yang sama, tanda jelas bahwa retakan itu digambar belakangan. Data batimetri resmi kawasan ini tersedia terbuka dan tidak menunjukkan bukaan baru apa pun.",
    redFlags:
      "Klaim \"bocoran orang dalam\" yang tidak bisa diverifikasi, urgensi menyimpan gambar \"sebelum hilang\", dan pencahayaan yang tidak konsisten dalam satu bingkai.",
    ifIgnored: { panic: 1, lockEvacuationSector: true },
    ifValidated: { removeCrisisToken: true, apBonus: 1 },
  },
  {
    id: "news_mv_03",
    category: "manipulasi_visual",
    title: "Live Streaming Palsu: Jalan Tol Terbelah Dua",
    body:
      "SEDANG BERLANGSUNG 🔴 Siaran langsung dari kilometer 42. Aspal terbelah, mobil terperosok, tidak ada petugas sama sekali. Jangan lewat jalur ini. Like biar makin banyak yang selamat.",
    attachedContent:
      "Siaran \"langsung\" berhitung penonton naik cepat. Bayangan kendaraan menunjukkan matahari sore, padahal keterangan siaran menyebut pukul sembilan pagi. Papan rambu di latar memakai bahasa negara lain.",
    targetSectorId: "kuning",
    truth: "hoax",
    locks: ["WHEN", "WHERE"],
    explanation:
      "Ini rekaman lama yang diputar ulang di kanal siaran langsung, trik umum untuk memanen penonton saat bencana. Arah bayangan menunjukkan sore hari, bertabrakan dengan jam yang diklaim, dan rambu jalan di latar berasal dari negara lain. Menyimpan satu tangkapan layar lalu menelusurinya sebagai gambar sudah cukup untuk menemukan unggahan aslinya bertahun-tahun lalu.",
    redFlags:
      "Label \"live\" tanpa kamera yang bergerak wajar, permintaan like disandingkan dengan keselamatan, bayangan yang tidak cocok dengan jam, dan rambu asing di latar.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { drawEvidence: 1, calmTargetSector: true },
  },
  {
    id: "news_mv_04",
    category: "manipulasi_visual",
    title: "Rekaman CCTV Detik-Detik Guncangan di Sendai",
    body:
      "Kamera toko di pusat Sendai merekam guncangan tadi pagi. Rak berjatuhan, lampu bergoyang lebih dari satu menit. Stempel waktu di sudut kanan bawah cocok dengan catatan gempa yang dirilis lembaga meteorologi hari ini. Tolong beredar apa adanya, tanpa ditambah narasi.",
    attachedContent:
      "Klip CCTV hitam putih dengan stempel tanggal dan jam berjalan di sudut. Getaran kamera berlanjut mulus tanpa potongan selama 68 detik.",
    targetSectorId: "teal",
    truth: "fakta",
    locks: ["WHEN", "WHERE"],
    explanation:
      "Rekaman ini bisa diverifikasi karena dua hal saling menguatkan: stempel waktu CCTV yang berjalan tanpa potongan, dan katalog gempa resmi yang mencantumkan waktu, magnitudo, serta kedalaman kejadian yang sama. Guncangan panjang lebih dari satu menit memang khas gempa besar berkedalaman dangkal di zona subduksi. Ketika waktu dan tempat sama-sama cocok dengan catatan independen, sebuah video layak dipercaya.",
    redFlags:
      "Tidak ada. Justru inilah polanya: satu rekaman mentah, satu catatan resmi, dua-duanya cocok. Menolak kabar yang benar sama mahalnya dengan menelan kabar palsu.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { stepTowardPosSiaga: true, removeCrisisToken: true },
  },

  // ——————————————————————————————————————————————————————————————————
  // MOTIF PENIPUAN
  // ——————————————————————————————————————————————————————————————————
  {
    id: "news_mp_01",
    category: "motif_penipuan",
    title: "Phishing: Rekrutmen Relawan Medis Internasional",
    body:
      "DIBUKA HARI INI: 200 relawan medis untuk kepulauan terdampak. Honor harian, tiket, dan asuransi ditanggung. Daftar lewat tautan di bawah, isi NIK, nomor rekening, dan kode OTP verifikasi. Kuota tinggal 12. Cepat sebelum tutup!",
    attachedContent:
      "Poster berlogo mirip organisasi kemanusiaan dunia. Alamat tautannya berakhiran domain acak berisi angka, bukan domain resmi lembaga tersebut.",
    targetSectorId: "biru",
    truth: "hoax",
    locks: ["WHY", "WHO"],
    explanation:
      "Tidak ada organisasi kemanusiaan yang sah meminta kode OTP — kode itu satu-satunya kunci yang memindahkan uang dari rekeningmu. Rekrutmen resmi selalu diumumkan di domain milik lembaganya sendiri, bukan di tautan pendek acak. Bencana dipilih sebagai latar justru karena kepanikan membuat orang berhenti memeriksa alamat situs.",
    redFlags:
      "Permintaan OTP dan nomor rekening, kuota yang menipis untuk memburu-buru, logo mirip tapi domain tidak cocok, dan imbalan yang terlalu murah hati untuk kerja darurat.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { removeCrisisToken: true, drawEvidence: 1 },
  },
  {
    id: "news_mp_02",
    category: "motif_penipuan",
    title: "Donasi Kilat Korban Megathrust — Transfer ke Rekening Ini",
    body:
      "Posko kami sudah 3 hari tanpa bantuan. Anak-anak tidur di aspal. Kirim berapa pun ke rekening atas nama pribadi di gambar, saya belikan langsung malam ini juga. Screenshot bukti transfer akan saya doakan satu per satu. 🙏",
    attachedContent:
      "Foto tenda pengungsian beresolusi tinggi bergaya jurnalistik, ditumpuk teks nomor rekening pribadi. Foto yang sama pernah dipakai untuk bencana di benua lain.",
    targetSectorId: "kuning",
    truth: "hoax",
    locks: ["WHY", "WHERE"],
    explanation:
      "Penggalangan dana yang sah berjalan lewat lembaga terdaftar yang wajib melaporkan pemasukan dan pengeluarannya, bukan lewat rekening pribadi tanpa jejak. Foto yang dilampirkan dapat ditelusuri sebagai gambar dan muncul dalam liputan bencana di wilayah lain beberapa tahun lalu. Menekan rasa iba adalah teknik penipuan tertua, dan bencana membuatnya paling efektif.",
    redFlags:
      "Rekening atas nama pribadi, tidak ada nama lembaga atau laporan penggunaan dana, foto daur ulang dari peristiwa lain, dan bahasa yang menyerang emosi alih-alih memberi informasi.",
    ifIgnored: { panic: 1, lockEvacuationSector: true },
    ifValidated: { calmTargetSector: true, apBonus: 1 },
  },
  {
    id: "news_mp_03",
    category: "motif_penipuan",
    title: "Jual Cepat: Alat Pendeteksi Gempa Pribadi, Akurat 99%",
    body:
      "Alat mungil ini berbunyi 30 menit sebelum guncangan. Sudah dipakai ribuan keluarga di kawasan rawan. Stok terbatas, harga naik besok. Jangan menunggu sampai menyesal — nyawa keluargamu lebih mahal dari harga alat ini.",
    attachedContent:
      "Video iklan berisi testimoni tiga orang dengan wajah tidak konsisten antar-adegan, dan grafik \"akurasi 99%\" tanpa satu pun sumber data.",
    targetSectorId: "teal",
    truth: "hoax",
    locks: ["WHY", "HOW"],
    explanation:
      "Sampai hari ini tidak ada teknologi mana pun yang bisa memprediksi gempa 30 menit sebelumnya; yang nyata adalah sistem peringatan dini, yang mendeteksi gelombang P setelah gempa sudah terjadi dan memberi jeda beberapa detik sampai puluhan detik saja. Klaim \"akurasi 99%\" mustahil karena tidak ada data prediksi yang bisa diuji. Alat semacam ini menjual rasa aman palsu yang justru membuat orang mengabaikan peringatan resmi.",
    redFlags:
      "Angka akurasi tanpa sumber, kelangkaan buatan (\"harga naik besok\"), testimoni yang wajahnya berubah antar-adegan, dan janji melampaui batas kemampuan sains.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { drawEvidence: 1, removeCrisisToken: true },
  },
  {
    id: "news_mp_04",
    category: "motif_penipuan",
    title: "BMKG Buka Kanal Info Gempa — Waspadai Akun Tiruan",
    body:
      "Info gempa dan peringatan dini tsunami disiarkan lewat kanal resmi BMKG: situs, aplikasi, dan akun terverifikasi. Beredar akun tiruan dengan nama nyaris sama yang menyebar jadwal gempa palsu. Periksa ejaan nama akun sebelum meneruskan apa pun ke grup keluarga.",
    attachedContent:
      "Tangkapan layar dua akun berdampingan: satu terverifikasi dengan riwayat unggahan bertahun-tahun, satu lagi berselisih satu huruf dan dibuat pekan lalu.",
    targetSectorId: "merah",
    truth: "fakta",
    locks: ["WHO", "WHERE"],
    explanation:
      "BMKG adalah lembaga resmi yang memang menyiarkan informasi gempa dan peringatan dini tsunami melalui kanal miliknya sendiri, dan kanal itu bisa dicocokkan langsung lewat situs lembaganya. Akun tiruan bekerja dengan meniru nama nyaris identik, karena mata manusia membaca bentuk kata, bukan huruf per huruf. Memeriksa umur akun dan riwayat unggahannya adalah cara termurah membedakan keduanya.",
    redFlags:
      "Tidak ada pada kabar ini — tandanya justru ada pada akun tiruan yang diperingatkan: umur akun baru, riwayat kosong, dan nama berselisih satu huruf.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { calmTargetSector: true, drawEvidence: 1 },
  },

  // ——————————————————————————————————————————————————————————————————
  // PSEUDOSAINS
  // ——————————————————————————————————————————————————————————————————
  {
    id: "news_ps_01",
    category: "pseudosains",
    title: "Air Laut Surut Mendadak di Teluk",
    body:
      "Air di teluk mundur ratusan meter dalam hitungan menit. Dasar laut kelihatan, ikan menggelepar, sebagian orang malah turun memungutinya. Kami baru merasakan guncangan panjang tadi. Semua yang di pantai, NAIK KE TEMPAT TINGGI SEKARANG, jangan tunggu sirene.",
    attachedContent:
      "Video vertikal 25 detik: garis pantai mundur jauh, terumbu terbuka, terdengar suara gemuruh rendah dari arah laut.",
    targetSectorId: "teal",
    truth: "fakta",
    locks: ["HOW", "WHERE"],
    explanation:
      "Surut mendadak adalah prekursor tsunami yang sungguhan: ketika palung gelombang tiba lebih dulu, permukaan laut tertarik mundur sebelum puncak gelombang datang. Bersama guncangan panjang dan suara gemuruh, ini salah satu dari tiga tanda alam yang diakui untuk evakuasi mandiri — artinya kamu bergerak tanpa menunggu sirene atau pengumuman. Jeda antara surut dan gelombang pertama sering hanya beberapa menit.",
    redFlags:
      "Tidak ada — dan justru di sinilah bahayanya terbalik. Kartu ini menguji apakah tim berani mempercayai kabar yang benar. Yang salah dalam video ini bukan kabarnya, melainkan orang-orang yang turun memungut ikan.",
    ifIgnored: { panic: 2, panicTargetSector: true },
    ifValidated: { stepTowardPosSiaga: true, removeCrisisToken: true },
  },
  {
    id: "news_ps_02",
    category: "pseudosains",
    title: "Ilmuwan Independen: Semeru Bisa Membelah Pulau Jawa",
    body:
      "Seorang peneliti independen memaparkan simulasi: jika energi di dapur magma dilepaskan sekaligus, Pulau Jawa akan terbelah menjadi dua bagian dan Selat Sunda meluas 60 km. Kajiannya ditolak jurnal arus utama — tentu saja. Silakan nilai sendiri.",
    attachedContent:
      "Slide presentasi berisi rumus panjang dan peta Jawa yang dibelah garis merah, tanpa nama lembaga, tanpa data seismik, dan tanpa daftar pustaka.",
    targetSectorId: "merah",
    truth: "hoax",
    locks: ["HOW", "WHO"],
    explanation:
      "Energi letusan gunung api besar sekalipun jauh lebih kecil daripada yang dibutuhkan untuk memutus kerak benua setebal puluhan kilometer; pulau terbelah adalah proses tektonik yang berlangsung jutaan tahun, bukan dalam satu peristiwa. Letusan Semeru berbahaya dengan cara yang nyata dan sudah cukup serius: awan panas dan lahar di sepanjang aliran sungai. Klaim ditolak jurnal bukan bukti kebenaran yang ditekan, melainkan hasil pemeriksaan sejawat yang normal.",
    redFlags:
      "Gelar \"peneliti independen\" tanpa lembaga, rumus panjang sebagai hiasan otoritas, penolakan jurnal dijadikan bukti, dan skala kerusakan yang jauh melampaui apa pun dalam catatan geologi.",
    ifIgnored: { panic: 2, panicTargetSector: true },
    ifValidated: { calmTargetSector: true, apBonus: 1 },
  },
  {
    id: "news_ps_03",
    category: "pseudosains",
    title: "Atlantis Bangkit! Daratan Baru Muncul di Pasifik Selatan",
    body:
      "Nelayan menemukan daratan yang semalam belum ada, lengkap dengan struktur bertingkat seperti bangunan. Ahli-ahli menolak berkomentar. Yang selama ini kita sebut mitos ternyata hanya sedang menunggu gilirannya naik. Sejarah harus ditulis ulang malam ini.",
    attachedContent:
      "Foto udara pulau berkabut dengan tebing bertingkat terlalu simetris; garis pantainya berulang dalam pola yang sama persis di tiga tempat berbeda.",
    targetSectorId: "biru",
    truth: "hoax",
    locks: ["WHAT", "HOW"],
    explanation:
      "Pulau baru memang bisa lahir di Pasifik Selatan, tetapi lewat proses yang bisa diamati: gunung api bawah laut menumpuk material erupsi sampai menembus permukaan, biasanya selama berminggu-minggu dan terpantau satelit serta lembaga vulkanologi. Pulau semacam itu berupa gundukan abu dan batu gelap yang rapuh, bukan tebing bertingkat simetris. Pola garis pantai yang berulang identik adalah sidik jari khas gambar buatan mesin.",
    redFlags:
      "Pola berulang dalam satu gambar, geometri terlalu rapi untuk bentang alam, \"ahli menolak berkomentar\" tanpa satu nama pun, dan sejarah besar yang diklaim berubah dalam semalam.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { drawEvidence: 2, removeCrisisToken: true },
  },
  {
    id: "news_ps_04",
    category: "pseudosains",
    title: "Erupsi Gunung Api Bawah Laut Picu Gelombang Tekanan Global",
    body:
      "Erupsi gunung api bawah laut di kawasan Tonga terekam satelit tadi malam. Barometer di berbagai benua mencatat lonjakan tekanan udara berjam-jam kemudian, dan beberapa pelabuhan jauh melaporkan permukaan laut naik-turun tidak wajar. Peringatan berlaku untuk seluruh pesisir kawasan, bukan hanya yang dekat.",
    attachedContent:
      "Citra satelit cuaca berurutan menunjukkan cincin awan memuai dari satu titik di laut, disertai grafik barometer dari tiga stasiun berbeda.",
    targetSectorId: "biru",
    truth: "fakta",
    locks: ["WHEN", "HOW"],
    explanation:
      "Erupsi bawah laut yang sangat kuat melontarkan uap dan abu sampai lapisan atas atmosfer dan melahirkan gelombang tekanan udara yang menjalar mengelilingi Bumi — persis seperti yang terekam barometer dunia saat erupsi Hunga Tonga pada 2022. Gelombang tekanan itu bisa mendorong permukaan laut di pelabuhan yang sangat jauh, fenomena yang disebut meteotsunami. Karena itu peringatan bisa berlaku untuk pesisir yang jaraknya ribuan kilometer dari sumbernya.",
    redFlags:
      "Tidak ada. Kabar ini menyebut waktu, memakai citra satelit berurutan, dan menampilkan data barometer dari beberapa stasiun independen — tiga hal yang tidak bisa dipalsukan sekaligus dengan mudah.",
    ifIgnored: { panic: 2, panicTargetSector: true },
    ifValidated: { stepTowardPosSiaga: true, removeCrisisToken: true },
  },
];

export const newsCardById: Record<string, NewsCard> = Object.fromEntries(
  newsCards.map((c) => [c.id, c])
);

export const newsCardsByCategory: Record<NewsCategory, NewsCard[]> = {
  sosial_takhayul: newsCards.filter((c) => c.category === "sosial_takhayul"),
  manipulasi_visual: newsCards.filter((c) => c.category === "manipulasi_visual"),
  motif_penipuan: newsCards.filter((c) => c.category === "motif_penipuan"),
  pseudosains: newsCards.filter((c) => c.category === "pseudosains"),
};

/** Semua id Kartu Berita, urutan kanonik. Reducer yang mengocok. */
export function buildNewsDeck(): string[] {
  return newsCards.map((c) => c.id);
}
