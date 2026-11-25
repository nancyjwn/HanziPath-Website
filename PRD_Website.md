# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Website Belajar Mandarin dengan Pengenalan Tulisan Tangan Berbasis Zero-Shot Learning

-   **Status:** Rancangan Pengembangan
-   **Jenis Produk:** Website Pembelajaran Bahasa Mandarin
-   **Frontend:** React.js
-   **Backend:** Python Flask
-   **Database:** PostgreSQL
-   **Model AI:** Zero-Shot Chinese Character Recognition (Stroke-Level
    Decomposition)

------------------------------------------------------------------------

## 1. Ringkasan Produk

Website ini merupakan platform pembelajaran bahasa Mandarin yang
ditujukan bagi pengguna pemula. Fitur utamanya adalah pengenalan
karakter Mandarin tulisan tangan menggunakan pendekatan *Zero-Shot
Learning* dengan *Stroke-Level Decomposition*.

Pengguna dapat mengunggah foto karakter Mandarin atau menuliskannya
secara langsung pada kanvas. Sistem kemudian memproses gambar dan
menampilkan karakter Mandarin digital, urutan stroke, Pinyin, serta arti
dalam Bahasa Inggris.

Selain fitur pengenalan tulisan tangan, website menyediakan kamus
Mandarin, flashcard berdasarkan level HSK, kuis menebak Pinyin, kata
harian, statistik pembelajaran, dan penyimpanan karakter pribadi.

Pengguna yang telah login dapat menyimpan karakter dari berbagai fitur,
mengikuti kuis, melihat riwayat pembelajaran, dan memantau perkembangan
kemampuan mereka.

### 1.1 Masalah yang Diselesaikan

1.  Pemula sering menemukan karakter Mandarin tulisan tangan yang belum
    diketahui sehingga kesulitan mencari artinya.
2.  Aplikasi kamus umumnya membutuhkan pengguna mengetahui Pinyin atau
    cara menggambar karakter.
3.  Materi pembelajaran kosakata Mandarin belum terhubung secara
    langsung dengan karakter yang ditemukan pengguna.
4.  Pengguna membutuhkan media latihan yang dapat membantu mengingat
    karakter, Pinyin, dan arti secara berulang.
5.  Pengguna membutuhkan informasi perkembangan belajar untuk mengetahui
    aktivitas dan hasil latihan mereka.

### 1.2 Nilai Utama Produk

Pengguna dapat mengenali karakter Mandarin tulisan tangan, mengetahui
Pinyin dan artinya, menyimpan karakter tersebut, kemudian mempelajarinya
kembali melalui flashcard dan kuis.

------------------------------------------------------------------------

## 2. Tujuan dan Metrik Keberhasilan

### 2.1 Tujuan Produk

1.  Membantu pengguna mengenali karakter Mandarin tulisan tangan dan
    memperoleh informasi Pinyin serta artinya.
2.  Menyediakan kamus Mandarin yang dapat digunakan untuk mencari
    karakter, Pinyin, dan arti.
3.  Membantu pengguna mempelajari kosakata berdasarkan level HSK.
4.  Memungkinkan pengguna menyimpan karakter yang belum dikuasai.
5.  Menyediakan statistik untuk memantau aktivitas dan perkembangan
    belajar.

### 2.2 Metrik Keberhasilan

-   Akurasi model minimal sama dengan hasil training saat ini, dengan
    target 0.90.
-   Waktu respons prediksi maksimal 5 detik sebagai target pengujian.
-   Skor System Usability Scale (SUS) minimal 68.
-   Seluruh skenario utama lolos pengujian Black-box dan User Acceptance
    Testing (UAT).

### 2.3 Batasan Produk (Non-Goals)

-   Pengenalan kalimat atau paragraf.
-   Pengenalan karakter tradisional.
-   Aplikasi mobile native.
-   Fitur sosial dan peringkat pengguna.
-   Halaman administrasi untuk pengelolaan data.
-   Terjemahan Bahasa Indonesia; arti kosakata menggunakan Bahasa
    Inggris.

------------------------------------------------------------------------

## 3. Target Pengguna

-   **Peran pengguna:** Pengguna (User).
-   **Target utama:** Mahasiswa, pelajar, atau masyarakat yang baru
    mempelajari bahasa Mandarin, terutama setara HSK 1--3.

**Karakteristik pengguna:**

-   Belum menguasai seluruh karakter Mandarin.
-   Belum terbiasa membaca atau menulis Pinyin.
-   Membutuhkan bantuan mengenali karakter tulisan tangan.
-   Ingin mempelajari kosakata melalui latihan singkat.
-   Mengakses website melalui laptop maupun smartphone.

------------------------------------------------------------------------

## 4. Aturan Akses dan Autentikasi

### 4.1 Pengguna Tamu

Pengguna tanpa login dapat:

-   Mengakses Landing Page/Home.
-   Melihat tiga kata harian.
-   Menggunakan fitur pengenalan tulisan tangan.
-   Mengakses kamus Mandarin.
-   Melihat daftar level HSK.
-   Melihat pratinjau flashcard.

### 4.2 Pengguna Login

Pengguna yang sudah login dapat:

-   Menyimpan karakter dari hasil pengenalan.
-   Menyimpan karakter dari kamus.
-   Menyimpan karakter langsung dari kuis.
-   Memulai dan mengerjakan kuis flashcard.
-   Melihat statistik flashcard harian.
-   Melihat riwayat kuis.
-   Melihat dan mengelola karakter tersimpan.
-   Melihat statistik pembelajaran di Profile.

### 4.3 Autentikasi

-   Registrasi menggunakan nama, email, dan kata sandi.
-   Login menggunakan email dan kata sandi.
-   Kata sandi disimpan dalam bentuk hash menggunakan bcrypt atau
    Argon2.
-   Autentikasi menggunakan JWT atau cookie sesi.
-   Pengguna dapat logout.
-   Login Google menjadi fitur tambahan dengan prioritas rendah.

**Perilaku pengguna tamu:**

Jika pengguna tamu menekan tombol yang memerlukan login, sistem
menampilkan dialog untuk masuk atau mendaftar. Setelah berhasil login,
pengguna dikembalikan ke halaman sebelumnya dan tindakan yang tertunda
dapat dilanjutkan.

------------------------------------------------------------------------

## 5. Struktur Halaman (Sitemap)

Website memiliki lima menu navigasi utama:

1.  Home (Landing Page).
2.  Pengenalan Tulisan Tangan.
3.  Kamus Mandarin.
4.  Flashcard HSK.
5.  Profile.

**Halaman tambahan:**

-   Masuk (Login).
-   Daftar (Register).

------------------------------------------------------------------------

## 6. Kebutuhan Fungsional

### 6.1 Home (Landing Page)

*Tujuan: Menjadi halaman pertama yang memperkenalkan identitas,
keunggulan, dan fitur website sekaligus mengarahkan pengguna untuk mulai
mempelajari bahasa Mandarin.*

Landing Page merupakan tampilan awal ketika pengguna membuka website.
Halaman ini menggabungkan pengenalan produk dan akses menuju aktivitas
pembelajaran. Landing Page tetap menjadi bagian dari Home, bukan halaman
navigasi terpisah.

#### A. Navigation Bar

-   `FR-H1`: Menampilkan logo dan nama Mandarin Learning.
-   `FR-H2`: Menampilkan navigasi menuju Home, Pengenalan Tulisan
    Tangan, Kamus Mandarin, dan Flashcard HSK.
-   `FR-H3`: Menampilkan tombol Masuk dan Daftar untuk pengguna tamu.
-   `FR-H4`: Menampilkan akses Profile untuk pengguna yang sudah login.
-   `FR-H5`: Navigasi responsif pada perangkat laptop, tablet, dan
    smartphone.

#### B. Hero Section

-   `FR-H6`: Menampilkan headline utama yang berkaitan dengan
    pembelajaran karakter Mandarin.
-   `FR-H7`: Menampilkan deskripsi singkat mengenai kemampuan website
    dalam mengenali tulisan tangan dan membantu pembelajaran Mandarin.
-   `FR-H8`: Menyediakan tombol utama "Mulai Mengenal Mandarin" yang
    mengarahkan pengguna ke halaman pengenalan tulisan tangan.
-   `FR-H9`: Menyediakan tombol sekunder "Jelajahi Fitur" yang
    mengarahkan pengguna ke bagian penjelasan fitur.
-   `FR-H10`: Menampilkan visual karakter Mandarin sebagai elemen utama
    Landing Page, disertai ilustrasi goresan atau proses pembentukan
    karakter.

#### C. Interactive Character Showcase

-   `FR-H11`: Menampilkan contoh karakter Mandarin beserta Pinyin dan
    arti Bahasa Inggris.
-   `FR-H12`: Menampilkan ilustrasi urutan pembentukan karakter melalui
    stroke.
-   `FR-H13`: Menyediakan animasi atau interaksi visual sederhana untuk
    memperlihatkan proses pembentukan karakter.
-   `FR-H14`: Menjadikan bagian ini sebagai representasi visual dari
    fitur pengenalan tulisan tangan.

#### D. Feature Highlights

-   `FR-H15`: Menampilkan tiga fitur utama website, yaitu Pengenalan
    Tulisan Tangan, Kamus Mandarin, dan Flashcard HSK.
-   `FR-H16`: Setiap fitur memiliki ilustrasi, nama, deskripsi singkat,
    dan tautan menuju halaman terkait.
-   `FR-H17`: Menampilkan fitur dengan tata letak visual yang konsisten
    dan responsif.

#### E. How It Works

-   `FR-H18`: Menampilkan panduan penggunaan website dalam tiga tahapan:
    1.  Tulis karakter Mandarin atau unggah foto.
    2.  Kenali karakter dan lihat informasi hasil prediksi.
    3.  Pelajari Pinyin dan arti, kemudian simpan karakter.
-   `FR-H19`: Setiap tahapan dilengkapi ilustrasi atau elemen visual
    pendukung.

#### F. Daily Words Preview

-   `FR-H20`: Menampilkan carousel berisi tiga kosakata Mandarin setiap
    hari.
-   `FR-H21`: Setiap kartu menampilkan karakter Mandarin, Pinyin, dan
    arti Bahasa Inggris.
-   `FR-H22`: Pengguna dapat membuka detail kosakata melalui halaman
    Kamus.
-   `FR-H23`: Pengguna login dapat menyimpan kosakata langsung dari
    kartu kata harian.
-   `FR-H24`: Ketiga kosakata dipilih dari daftar kosakata HSK.
-   `FR-H25`: Pemilihan kata menggunakan mekanisme berbasis tanggal
    sehingga tiga kata yang sama ditampilkan kepada seluruh pengguna
    pada tanggal yang sama.
-   `FR-H26`: Kosakata tidak boleh berulang dalam 30 hari terakhir.
-   `FR-H27`: Kosakata berganti otomatis ketika tanggal berganti.

#### G. Call to Action

-   `FR-H28`: Menampilkan ajakan kepada pengguna untuk mulai mempelajari
    bahasa Mandarin.
-   `FR-H29`: Menyediakan tombol Daftar dan Masuk bagi pengguna tamu.
-   `FR-H30`: Untuk pengguna yang sudah login, tombol diarahkan ke
    aktivitas pembelajaran.

#### H. Statistik Flashcard Harian

-   `FR-H31`: Untuk pengguna login, Home menampilkan statistik aktivitas
    flashcard hari ini.
-   `FR-H32`: Statistik menampilkan jumlah kartu yang telah dikerjakan
    dan jumlah jawaban benar.
-   `FR-H33`: Menampilkan grafik batang aktivitas flashcard selama tujuh
    hari terakhir.
-   `FR-H34`: Satu kartu dihitung setiap kali pengguna menjawab satu
    soal kuis.
-   `FR-H35`: Untuk pengguna tamu, bagian statistik diganti dengan
    ajakan masuk atau mendaftar.
-   *(Data statistik bersumber dari tabel quiz_answers).*

#### I. Footer

-   `FR-H36`: Menampilkan identitas dan deskripsi singkat website.
-   `FR-H37`: Menampilkan tautan navigasi menuju halaman utama.
-   `FR-H38`: Menampilkan informasi hak cipta website.

#### J. Arahan Visual dan Interaksi Landing Page

-   Menggunakan gaya editorial modern bernuansa budaya Mandarin.
-   Menggunakan warna dasar warm cream/ivory, aksen merah cinnabar, dan
    teks charcoal.
-   Menggunakan tipografi yang mudah dibaca serta karakter Mandarin
    berukuran besar sebagai elemen visual.
-   Menggunakan ilustrasi stroke, tinta, atau kaligrafi secara terarah
    agar tidak mengganggu keterbacaan.
-   Menggunakan animasi ringan pada elemen tertentu, seperti karakter
    showcase dan transisi bagian halaman.
-   Menghindari animasi berlebihan yang memperlambat pemuatan halaman.
-   Memastikan seluruh bagian Landing Page dapat digunakan pada laptop,
    tablet, dan smartphone.
-   Menjaga konsistensi gaya visual dengan halaman Pengenalan, Kamus,
    Flashcard, Login, Register, dan Profile.

### 6.2 Pengenalan Tulisan Tangan (Zero-Shot Learning)

*Tujuan: Mengubah gambar karakter Mandarin tulisan tangan menjadi
karakter digital, urutan stroke, Pinyin, dan arti Bahasa Inggris.*

#### A. Metode Input

1.  **Unggah Foto:** Memilih gambar dari galeri (JPG, PNG, WEBP; maks. 5
    MB), menampilkan pratinjau gambar, dan menyediakan pemotongan area
    karakter sebelum diproses.
2.  **Kanvas Tulisan:** Menulis menggunakan mouse atau layar sentuh,
    tombol Hapus Semua, tombol Undo, area kanvas persegi, dan ketebalan
    garis yang disesuaikan.

#### B. Kebutuhan Fungsional

-   `FR-M1`: Pengguna dapat menggunakan fitur pengenalan tanpa login.
-   `FR-M2`: Pengguna dapat mengunggah gambar dan menulis karakter
    melalui kanvas.
-   `FR-M3`: Sistem menampilkan indikator loading ketika gambar
    diproses.
-   `FR-M4`: Sistem menampilkan karakter Mandarin digital.
-   `FR-M5`: Sistem menampilkan urutan stroke hasil prediksi.
-   `FR-M6`: Sistem menampilkan Pinyin menggunakan tanda nada.
-   `FR-M7`: Sistem menampilkan maksimal tiga arti utama dalam Bahasa
    Inggris.
-   `FR-M8`: Menyediakan tautan menuju detail karakter pada Kamus.
-   `FR-M9`: Menyediakan tombol Simpan Karakter yang membutuhkan login.
-   `FR-M10`: Menyediakan tombol Coba Lagi untuk mengulang pengenalan.
-   `FR-M11` (Should): Menampilkan kandidat karakter alternatif.
-   `FR-M12` (Should): Menyediakan fitur koreksi hasil pengenalan.
-   `FR-M13` (Could): Menyediakan pemutaran suara pengucapan.

#### C. Batasan Sistem

-   Satu karakter untuk setiap gambar.
-   Karakter simplified.
-   Karakter harus termasuk dalam cakupan 3.755 karakter model.
-   Hasil merupakan prediksi model dan tidak menjamin selalu benar.

### 6.3 Kamus Mandarin

*Tujuan: Menyediakan fasilitas pencarian dan informasi karakter
Mandarin.*

-   `FR-K1`: Pencarian menerima karakter Mandarin, Pinyin, dan kata
    Bahasa Inggris.
-   `FR-K2`: Pencarian Pinyin mendukung tanda nada maupun angka nada.
-   `FR-K3`: Menampilkan daftar hasil berupa karakter, Pinyin, dan
    ringkasan arti.
-   `FR-K4`: Menyediakan halaman detail kosakata.
-   `FR-K5`: Detail menampilkan seluruh arti Bahasa Inggris.
-   `FR-K6`: Menampilkan level HSK jika kosakata tersedia dalam daftar
    HSK.
-   `FR-K7`: Menyediakan tombol Simpan Karakter.
-   `FR-K8`: Menampilkan pesan apabila pencarian tidak menghasilkan
    data.
-   `FR-K9` (Could): Menyediakan pemutaran suara pengucapan.

*(Sumber data kamus menggunakan CC-CEDICT dengan atribusi dan lisensi
yang sesuai).*

### 6.4 Flashcard HSK

*Tujuan: Membantu pengguna mengingat kosakata Mandarin melalui latihan
menebak Pinyin berdasarkan karakter yang ditampilkan.*

#### A. Halaman Daftar Level HSK

-   `FR-F1` s.d. `FR-F5`: Menampilkan daftar level HSK 1--6, jumlah
    kosakata, pratinjau untuk tamu, progres untuk login, serta tombol
    Mulai Quiz.

#### B. Pengaturan Kuis

-   `FR-F6` & `FR-F7`: Memilih level HSK dan jumlah soal (10, 20, atau
    seluruh kosakata pada level tersebut).
-   `FR-F8`: Membuat sesi kuis baru dan menentukan daftar karakter.

#### C. Kuis Menebak Pinyin

-   `FR-F9` s.d. `FR-F18`: Menampilkan karakter, pertanyaan Pinyin,
    kolom input, petunjuk format, validasi jawaban, status benar/salah,
    Pinyin benar dan arti, tombol lanjut, serta indikator progres.

#### D. Simpan Karakter Saat Kuis

-   `FR-F19` s.d. `FR-F23`: Menyimpan karakter dari kuis sebelum/sesudah
    menjawab, penanda status, terhubung ke Profile, dan mencegah
    penyimpanan duplikat.

#### E. Hasil Kuis (Quiz Summary)

-   `FR-F24` s.d. `FR-F32`: Menampilkan ringkasan (benar, salah,
    persentase), daftar jawaban salah beserta arti/Pinyin, penyimpanan
    karakter salah, riwayat kuis, dan pembaruan statistik Home.

#### F. Pengulangan Karakter & Deck

-   `FR-F33`--`FR-F35` (Should): Pengulangan karakter salah prioritas
    tinggi berbasis konsep Leitner.
-   `FR-F36`--`FR-F38` (Should): Deck Karakter Saya yang berisi seluruh
    karakter tersimpan.

### 6.5 Profile

*Tujuan: Menjadi pusat informasi akun, karakter tersimpan, dan
perkembangan pembelajaran.*

-   `FR-P1` s.d. `FR-P13`: Menampilkan/mengubah nama, mengganti sandi,
    daftar karakter tersimpan, detail sumber/tanggal, hapus karakter,
    jumlah karakter, jumlah kuis, akurasi, progres HSK, riwayat kuis,
    tombol logout, dan opsi hapus akun (Could).

------------------------------------------------------------------------

## 7. Alur Pengguna Utama

1.  **Alur Landing Page:** Pengguna membuka website → melihat pengenalan
    produk dan fitur → memilih Pengenalan, Kamus, atau Flashcard →
    diarahkan ke halaman yang dipilih.
2.  **Alur Pengenalan & Penyimpanan:** Buka halaman → Pilih
    unggah/kanvas → Klik kenali → Backend proses model ZSL → Tampil
    hasil → Klik simpan → Autentikasi (jika belum) → Tersimpan di
    Profile.
3.  **Alur Kata Harian:** Buka Home → Backend ambil tanggal dan tentukan
    3 kata unik (tanpa repetisi 30 hari) → Carousel tampil → Ganti
    otomatis saat tanggal berganti.
4.  **Alur Kuis Flashcard:** Buka Flashcard → Pilih level → Mulai →
    Autentikasi → Pilih soal → Sesi kuis → Jawab Pinyin → Validasi →
    Ringkasan → Perbarui statistik.
5.  **Alur Kamus:** Buka Kamus → Masukkan query → Tampil hasil → Buka
    detail → Simpan karakter.

------------------------------------------------------------------------

## 8. Kebutuhan Non-Fungsional

-   **8.1 Performa:** Waktu respons prediksi maksimal 5 detik; model
    dimuat sekali saat startup backend; endpoint efisien.
-   **8.2 Usability:** Bahasa Indonesia; responsif (HP, tablet, laptop);
    karakter Mandarin ukuran besar; tombol/kanvas mudah dijangkau.
-   **8.3 Keamanan:** Password hashing; HTTPS di produksi; validasi file
    di backend; rate limiting pada login/prediksi; validasi kepemilikan
    data.
-   **8.4 Kompatibilitas:** Chrome, Edge, Firefox, Safari versi terbaru.
-   **8.5 Konsistensi Visual:** Landing Page dan seluruh halaman
    internal menggunakan sistem warna, tipografi, komponen, ikon, dan
    pola interaksi yang konsisten.

------------------------------------------------------------------------

## 9. Arsitektur Sistem

### 9.1 Teknologi

-   **Frontend:** React.js
-   **Styling:** CSS / Tailwind CSS
-   **Grafik:** Recharts
-   **Backend:** Python Flask
-   **Database:** PostgreSQL (ORM: SQLAlchemy)
-   **Autentikasi:** JWT
-   **Model AI:** PyTorch (Zero-Shot Learning)
-   **Kamus & Data:** CC-CEDICT & Dataset HSK

### 9.2 Arsitektur Umum & Komunikasi

Frontend React.js berkomunikasi melalui REST API (`/api/v1`) dengan
backend Flask. Flask mengelola database PostgreSQL dan model PyTorch
yang dimuat di memori server.

------------------------------------------------------------------------

## 10. Rancangan API Backend Flask

Prefix: `/api/v1`

**Autentikasi:** - `POST /auth/register` - Registrasi pengguna -
`POST /auth/login` - Login pengguna - `GET /auth/me` - Informasi akun
aktif - `POST /auth/logout` - Logout pengguna

**Pengenalan:** - `POST /predict`

**Kamus:** - `GET /dictionary/search?q=` - `GET /dictionary/{id}`

**Flashcard & Kuis:** - `GET /hsk/levels` - `GET /hsk/{level}/cards` -
`POST /quiz/sessions` - `POST /quiz/sessions/{id}/answers` -
`GET /quiz/sessions/{id}/summary` - `GET /quiz/history`

**Kata Harian & Statistik:** - `GET /daily-words` -
`GET /stats/flashcard-daily?days=7` - `GET /profile/stats`

**Karakter Tersimpan:** - `GET /saved` - `POST /saved` -
`DELETE /saved/{id}`

*Catatan implementasi: daftar endpoint pada bagian ini merupakan
rancangan kebutuhan API. Pada tahap integrasi, frontend harus mengikuti
endpoint, parameter, autentikasi, dan format respons yang benar-benar
tersedia pada backend. Perubahan endpoint backend tidak dilakukan hanya
untuk menyamakan nama dengan rancangan PRD.*

------------------------------------------------------------------------

## 11. Rancangan Database (PostgreSQL)

1.  `users` (id, nama, email, password_hash, dibuat_pada)
2.  `dictionary_entries` (id, simplified, traditional, pinyin_numbered,
    pinyin_display, meanings)
3.  `hsk_words` (id, level, entry_id)
4.  `saved_characters` (id, user_id, entry_id, sumber, dibuat_pada ---
    *Unique constraint on user_id & entry_id*)
5.  `quiz_sessions` (id, user_id, level, jumlah_soal, jumlah_benar,
    jumlah_salah, dimulai_pada, selesai_pada)
6.  `quiz_answers` (id, session_id, hsk_word_id, jawaban_pengguna,
    benar, dijawab_pada)
7.  `card_progress` (id, user_id, hsk_word_id, jumlah_benar,
    jumlah_salah, terakhir_dilihat)
8.  `daily_words` (id, tanggal, hsk_word_id, urutan --- *Unique
    constraint on tanggal & hsk_word_id*)

------------------------------------------------------------------------

## 12. Prioritas Pengembangan (MoSCoW)

-   **Must Have:** Registrasi/login/logout, Landing Page/Home,
    Pengenalan (upload/kanvas), ZSL model, Kamus, HSK levels, Kuis
    Pinyin, Validasi benar/salah, Ringkasan kuis, Simpan karakter,
    Profile dasar, Riwayat kuis.
-   **Should Have:** Crop gambar, Kandidat alternatif, Koreksi hasil,
    Carousel 3 kata harian, Statistik harian, Grafik 7 hari, Deck
    Karakter Saya, Statistik Profile, Pengulangan karakter salah.
-   **Could Have:** Suara pengucapan, Kuis pilihan ganda, Login Google,
    Hapus akun.
-   **Won't Have:** Multi-karakter sekaligus, Karakter tradisional,
    Mobile app native, Admin panel, Fitur sosial/ranking.

------------------------------------------------------------------------

## 13. Rencana Pengujian

1.  **Pengujian Model:** Akurasi dataset, uji foto nyata, uji kanvas,
    waktu respons.
2.  **Pengujian Fungsional (Black-box):** Uji seluruh fitur fungsional,
    termasuk navigasi Landing Page dan responsivitas.
3.  **Pengujian Integrasi:** React & Flask, Flask & PostgreSQL, Backend
    & PyTorch, Kamus, Kuis, Statistik.
4.  **User Acceptance Testing (UAT):** Melibatkan pengguna pemula.
5.  **Pengujian SUS:** System Usability Scale untuk mengukur tingkat
    usability.

------------------------------------------------------------------------

## 14. Risiko dan Mitigasi

-   *Akurasi model tulisan nyata rendah* → Preprocessing dan kandidat
    alternatif.
-   *Model di luar cakupan* → Penjelasan batasan 3.755 karakter.
-   *Prediksi lambat* → Model dimuat sekali saat startup.
-   *Kata harian berulang* → Pencatatan riwayat 30 hari.
-   *Statistik tidak sinkron* → Sumber data terpusat pada
    `quiz_answers`.
-   *Format Pinyin inkonsisten* → Normalisasi Pinyin sebelum validasi.
-   *Duplikasi karakter tersimpan* → Unique constraint database.
-   *Landing Page terlalu berat* → Optimasi ukuran gambar, animasi, dan
    aset visual.

------------------------------------------------------------------------

## 15. Rencana Pengerjaan

-   **Fase 1:** Fondasi Sistem (React setup, Flask backend, PostgreSQL,
    Auth, Kamus/HSK import).
-   **Fase 2:** Kamus & Flashcard (Halaman kamus, pencarian, kuis
    Pinyin, validasi, ringkasan, simpan karakter).
-   **Fase 3:** Integrasi Model AI (Checkpoint, endpoint predict,
    PyTorch integration, upload/kanvas, preprocessing).
-   **Fase 4:** Home & Profile (Landing Page, carousel harian, statistik
    harian, grafik 7 hari, halaman profile, deck tersimpan).
-   **Fase 5:** Pengujian & Penyempurnaan (Black-box, integrasi, model
    testing, responsivitas, UAT/SUS).

------------------------------------------------------------------------

## 16. Asumsi dan Keputusan

1.  Menggunakan skema level HSK.
2.  Arti kosakata menggunakan Bahasa Inggris.
3.  Validasi Pinyin/nada.
4.  Input teks Pinyin sebagai metode utama kuis.
5.  Sumber dataset HSK dan CC-CEDICT.
6.  Mekanisme tanggal untuk kata harian.
7.  Spesifikasi server dan kebijakan penyimpanan file gambar.
8.  Landing Page menjadi bagian dari Home dan bukan halaman navigasi
    terpisah.
9.  Gaya visual utama menggunakan pendekatan editorial modern bernuansa
    budaya Mandarin dengan warna warm cream/ivory, merah cinnabar, dan
    charcoal.

------------------------------------------------------------------------

## 17. Ketentuan Implementasi Tambahan

-   **17.1 Konsistensi Statistik:** Dihitung ketat dari data
    `quiz_answers` yang valid.
-   **17.2 Konsistensi Sesi Kuis:** Pembuatan sesi, jawaban per soal,
    pencegahan pengiriman ganda, ringkasan tervalidasi.
-   **17.3 Konsistensi Penyimpanan Karakter:** Terpusat pada tabel
    `saved_characters` dari berbagai sumber (pengenalan, kamus, kuis,
    kata harian).
-   **17.4 Konsistensi Kata Harian:** Berbasis zona waktu sistem, tidak
    berulang 30 hari, dengan fallback penanganan data jika kosong.
-   **17.5 Konsistensi Landing Page:** Landing Page menjadi pintu masuk
    utama website. Komponen navigasi, tombol ajakan, tautan fitur, dan
    konten kata harian harus mengarah ke halaman atau fungsi yang sesuai
    dengan status autentikasi pengguna.
-   **17.6 Pemisahan Konten Publik dan Pengguna Login:** Konten
    pengenalan produk dapat dilihat seluruh pengguna, sedangkan
    statistik personal dan tindakan penyimpanan hanya tersedia bagi
    pengguna yang sudah login.
