# HanziPath - Platform Pembelajaran Bahasa Mandarin Interaktif

Sistem Pembelajaran Bahasa Mandarin Terpadu Berbasis Web dengan Integrasi Pengenalan Karakter Tulisan Tangan Menggunakan Deep Learning (ResNet-Transformer).

---

## 1. Deskripsi Proyek

**HanziPath** adalah platform pembelajaran bahasa Mandarin interaktif yang dikembangkan sebagai bagian dari penelitian tugas akhir (skripsi). Platform ini dirancang untuk memfasilitasi pembelajaran aksara Hanzi (*Chinese Characters*) secara holistik, mencakup pengenalan ortografis, pelafalan Pinyin, dekomposisi goresan (*stroke order*), kurikulum standar HSK 1 hingga 6, kamus digital komprehensif, serta evaluasi hasil belajar melalui analitik pengguna.

Keunggulan utama platform ini terletak pada integrasi modul kecerdasan buatan (*Artificial Intelligence*) untuk pengenalan tulisan tangan pengguna (*Handwritten Chinese Character Recognition* / HCCR). Dengan memadukan jaringan konvolusional ResNet sebagai pengekstrak fitur visual citra dan Transformer Decoder sebagai pemproyeksi sekuens goresan, sistem mampu memprediksi karakter Hanzi secara tepat serta menangani ambiguitas karakter berurutan goresan identik melalui mekanisme *Template Matching*.

---

## 2. Fitur Utama Sistem

### A. Pengenalan Tulisan Tangan AI (Handwriting Recognition)
- Kanvas interaktif digital yang mendukung penggambaran langsung dengan kuas kaligrafi digital (*brush rendering*).
- Pilihan garis pemandu tradisional Tiongkok: Garis Kisi Beras (*Mi Zi Ge* / 米字格), Garis Kisi Sawah (*Tian Zi Ge* / 田字格), atau kanvas polos.
- Pengenalan berbasis dekomposisi 5 goresan ortografis Wubi (Héng, Shù, Piě, Diǎn, Zhé).
- Toleransi galat penulisan melalui koreksi leksikal Levenshtein Distance.
- Resolusi ambiguitas visual berbasis Mean Squared Error (MSE) terhadap sampel template font standar (SimSun dan SimFang).
- Hasil pengenalan terintegrasi langsung dengan entri kamus, pelafalan audio Pinyin, dan tombol simpan ke profil pengguna.

### B. Kurikulum Standar HSK Level 1 hingga 6 & Flashcard Adaptif
- Penjelajahan 4.991 kosakata resmi HSK 1 sampai 6 lengkap dengan contoh kalimat aplikatif.
- Mode latihan kartu kilas (*flashcard*) interaktif dengan animasi 3D flip 60 FPS.
- Engine kuis adaptif pilihan ganda dengan pelacakan skor, waktu pengerjaan, akurasi, dan status penyelesaian sesi.
- Fitur pembatalan sesi (*cancel session*) dan pemulihan status kuis secara aman.

### C. Kamus Digital Mandarain (CC-CEDICT Dictionary)
- Akses ke 122.982 entri leksikal CC-CEDICT.
- Pencarian instan multibahasa: karakter Hanzi (Simplified dan Traditional), Pinyin beraksen/berangka, dan terjemahan bahasa Inggris.
- Input Method Editor (IME) Pinyin terintegrasi di dalam bilah pencarian kamus.
- Penyaringan berdasarkan tingkat HSK (1 - 6) dan jumlah goresan (*stroke count*).

### D. Rotasi Kosakata Harian (Daily Words)
- Tampilan kartu kata harian yang diperbarui secara otomatis setiap hari.
- Dilengkapi karakter Hanzi berukuran besar, nomor nada Pinyin, definisi leksikal, dan tombol simpan cepat.

### E. Analitik Belajar & Dasbor Pengguna (User Analytics)
- Grafik spline interaktif pelacak intensitas belajar dan jumlah pertanyaan yang dijawab per hari selama satu minggu.
- Indikator target harian (*Daily Target Progress*) dan mingguan (*Weekly Goal Tracker*).
- Manajemen riwayat latihan kuis (*Quiz History*) beserta rincian jawaban benar dan salah.
- Manajemen koleksi kosakata tersimpan (*Saved Characters Collection*) dengan filter sumber penambahan (Kamus, Flashcard, Kata Harian, atau AI Tulisan Tangan).

### F. Desain Antarmuka Berbudaya Oriental (Oriental Scholar Aesthetic)
- Mengadopsi palet warna klasik sarjana oriental: *Rice Paper* (#FBF9F5), *Charcoal Ink* (#292723), dan *Cinnabar Red* (#9E2A2B).
- Tipografi klasik berbasis Noto Serif SC dan Playfair Display dipadukan dengan sans-serif modern.
- Responsif penuh pada berbagai resolusi layar mulai dari perangkat ponsel pintar (360px) hingga layar desktop (1920px).

---

## 3. Spesifikasi Arsitektur Teknologi

### Frontend
- **Framework:** React 19.3.1 (Single Page Application)
- **Tooling & Bundler:** Vite 8.3.6
- **Routing:** React Router DOM 7.18.5
- **Styling:** Tailwind CSS v4.3.5
- **Animasi & Interaksi:** Motion v14.10.1 (Framer Motion)
- **Komunikasi Data:** Axios 1.21.0
- **Audio Synthesizer:** Web SpeechSynthesis API (zh-CN)

### Backend
- **Bahasa & Runtime:** Python 3.12
- **Web Framework:** Flask 3.1.3
- **Autentikasi & Keamanan:** Flask-JWT-Extended 4.7.4, Werkzeug Password Hashing (pbkdf2:sha256)
- **Cross-Origin Resource Sharing:** Flask-CORS 6.0.5
- **ORM & Database Toolkit:** SQLAlchemy 2.1.8 & Flask-SQLAlchemy 3.1.1
- **Driver Database:** psycopg2-binary 2.9.13

### Basis Data
- **Engine:** PostgreSQL 16
- **Jumlah Tabel:** 9 entitas relasional terindeks
- **Kapasitas Korpus:** 122.982 entri kamus CC-CEDICT, 4.991 kosakata kurikulum HSK

### Kecerdasan Buatan (AI Engine)
- **Deep Learning Framework:** PyTorch 2.4.1 (CPU Inference Optimized)
- **Arsitektur Jaringan:** ResNet-based Feature Extractor + Multi-Head Self-Attention Transformer Decoder
- **Prapemrosesan Citra:** Pillow (PIL) 13.0.0, NumPy 1.26.4
- **Perhitungan Jarak Leksikal:** RapidFuzz 3.14.6 (Levenshtein Distance)
- **Format Model & Bobot:** PyTorch State Dict (`best_model.pth` ~301 MB), Tensor Embeddings (`simsun_features.pt` & `simfang_features.pt` ~356 MB)

---

## 4. Struktur Direktori Proyek

```text
ChineseLearning/
├── backend/
│   ├── ai_model/                        # Subsistem AI Pengenalan Tulisan Tangan
│   │   ├── config.py                    # Hiperparameter model dan dataset
│   │   ├── inference.py                 # Engine inferensi utama (HandwritingRecognizer)
│   │   ├── util.py                      # Kamus 5 goresan, Levenshtein distance, utilitas
│   │   ├── data/
│   │   │   ├── decompose-stroke-3755.txt # Basis ortografi 3.755 karakter GB2312
│   │   │   └── lmdbReader.py            # Pembaca dataset LMDB berkecepatan tinggi
│   │   ├── model/
│   │   │   └── transformer.py           # Arsitektur ResNet Encoder + Transformer Decoder
│   │   ├── templates/
│   │   │   ├── simsun.pkl / simfang.pkl # Sampel font acuan SimSun & SimFang
│   │   │   └── simsun_features.pt / simfang_features.pt # Vektor fitur visual template
│   │   └── weights/
│   │       └── best_model.pth           # Bobot biner model PyTorch terlatih (~301 MB)
│   ├── app/
│   │   ├── models/                      # Entitas ORM SQLAlchemy (User, Dictionary, HSK, Quiz, dll)
│   │   ├── routes/                      # Pengendali rute REST API
│   │   │   ├── auth.py                  # Endpoint registrasi, login, dan profil
│   │   │   ├── daily_word.py            # Endpoint kosakata harian
│   │   │   ├── dictionary.py            # Endpoint pencarian kamus CC-CEDICT
│   │   │   ├── flashcard.py             # Endpoint sesi latihan, flashcard, dan submit jawaban
│   │   │   ├── handwriting.py           # Endpoint unggah citra tulisan tangan & inferensi AI
│   │   │   ├── hsk.py                   # Endpoint daftar kosakata HSK level 1-6
│   │   │   ├── saved_character.py       # Endpoint kosakata favorit/tersimpan
│   │   │   └── statistics.py            # Endpoint analitik, agregasi akurasi, dan riwayat
│   │   ├── services/                    # Logika bisnis pendukung
│   │   ├── extensions.py                # Inisialisasi db, jwt, dan cors
│   │   └── __init__.py                  # Factory method pembuatan aplikasi Flask
│   ├── config.py                        # Konfigurasi aplikasi dan pemuatan variabel lingkungan
│   ├── requirements.txt                 # Daftar dependensi paket Python
│   ├── check_models.py                  # Skrip verifikasi tabel basis data dan jumlah data
│   └── run.py                           # Titik masuk eksekusi server Flask
├── frontend/
│   ├── src/
│   │   ├── assets/                      # Aset grafis oriental, tekstur kertas, dan gambar latar
│   │   ├── components/
│   │   │   ├── common/                  # Komponen proteksi rute, tombol scroll, dan modal
│   │   │   └── home/                    # Bagian-bagian beranda (Hero, Carousel, FAQ, Quiz)
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Penyedia state global autentikasi dan token JWT
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx           # Kerangka tata letak utama aplikasi
│   │   │   ├── Navbar.jsx               # Navigasi atas adaptif
│   │   │   └── Footer.jsx               # Informasi kaki halaman
│   │   ├── pages/                       # Halaman tampilan pengguna
│   │   │   ├── HomePage.jsx             # Halaman utama (beranda tamu)
│   │   │   ├── AuthPage.jsx             # Halaman masuk dan pendaftaran akun
│   │   │   ├── DictionaryPage.jsx       # Halaman pencarian kamus digital terpadu
│   │   │   ├── FlashcardPage.jsx        # Halaman pemilihan level HSK dan latihan kuis
│   │   │   ├── FlashcardDetailPage.jsx  # Halaman rincian daftar kata per level HSK
│   │   │   ├── HandwritingPage.jsx      # Halaman kanvas pengenalan tulisan tangan AI
│   │   │   └── ProfilePage.jsx          # Halaman dasbor analitik dan statistik pengguna
│   │   ├── services/
│   │   │   └── api.js                   # Klien HTTP Axios terpusat dengan interceptor JWT
│   │   ├── utils/                       # Utilitas kalimat contoh dan IME Pinyin
│   │   ├── App.jsx                      # Definisi routing peramban
│   │   └── main.jsx                     # Titik masuk render React DOM
│   ├── eslint.config.js                 # Konfigurasi ESLint flat standard
│   ├── package.json                     # Konfigurasi dependensi Node.js
│   └── vite.config.js                   # Konfigurasi bundler Vite dan Tailwind plugin
├── ChineseLearningDataset/
│   └── .env                             # Berkas konfigurasi variabel lingkungan
└── README.md                            # Dokumentasi resmi proyek
```

---

## 5. Panduan Instalasi dan Menjalankan Sistem

### Prasyarat Sistem
- **Sistem Operasi:** Windows 10/11, macOS, atau Linux
- **Node.js:** Versi 18.x atau lebih baru (disarankan LTS)
- **Python:** Versi 3.10 hingga 3.12
- **Basis Data:** PostgreSQL versi 14 atau lebih baru

---

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/username/HanziPath-Website.git
cd HanziPath-Website
```

---

### Langkah 2: Konfigurasi Basis Data PostgreSQL
1. Buat basis data baru di PostgreSQL:
   ```sql
   CREATE DATABASE chineselearning;
   ```
2. Pastikan ekstensi dan hak akses pengguna PostgreSQL telah sesuai.

---

### Langkah 3: Konfigurasi Variabel Lingkungan
Pastikan berkas `.env` telah tersedia pada direktori `ChineseLearningDataset/.env` (atau direktori root) dengan variabel berikut:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chineselearning
DB_USER=postgres
DB_PASSWORD=password_postgresql_anda
SECRET_KEY=kunci_rahasia_flask_acak_anda
JWT_SECRET_KEY=kunci_rahasia_jwt_acak_anda
FLASK_DEBUG=true
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

### Langkah 4: Menjalankan Backend Flask
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan virtual environment Python:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Pasang seluruh dependensi pustaka:
   ```bash
   pip install -r requirements.txt
   ```
4. Verifikasi koneksi basis data:
   ```bash
   python check_models.py
   ```
5. Jalankan server backend:
   ```bash
   python run.py
   ```
   *Server backend akan aktif di `http://127.0.0.1:5000`.*

---

### Langkah 5: Menjalankan Frontend Vite
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Pasang paket dependensi Node.js:
   ```bash
   npm install
   ```
3. Jalankan server pengembang (*development server*):
   ```bash
   npm run dev
   ```
   *Antarmuka web dapat diakses melalui peramban di `http://localhost:5173`.*

---

## 6. Dokumentasi Endpoint REST API

Berikut adalah rangkuman rute utama yang disediakan oleh backend Flask (`/api/v1`):

| Kelompok | Metode | Endpoint | Deskripsi | Autentikasi |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | POST | `/api/v1/auth/register` | Pendaftaran akun pengguna baru | Bebas |
| **Auth** | POST | `/api/v1/auth/login` | Masuk akun dan penerbitan token JWT | Bebas |
| **Auth** | GET | `/api/v1/auth/profile` | Mengambil data profil pengguna aktif | Perlu JWT |
| **Dictionary** | GET | `/api/v1/dictionary` | Pencarian kamus dengan query dan filter HSK | Bebas |
| **Dictionary** | GET | `/api/v1/dictionary/<id>` | Detail entri kosakata dan contoh kalimat | Bebas |
| **Daily Words** | GET | `/api/v1/daily-words` | Mengambil daftar rotasi kosakata harian | Bebas |
| **HSK** | GET | `/api/v1/hsk/<level>` | Mengambil kosakata berdasarkan level HSK 1-6 | Bebas |
| **Flashcard** | POST | `/api/v1/flashcards/sessions` | Membuat sesi kuis flashcard baru | Perlu JWT |
| **Flashcard** | POST | `/api/v1/flashcards/sessions/<id>/answer` | Mengirim jawaban dan menghitung skor | Perlu JWT |
| **Flashcard** | POST | `/api/v1/flashcards/sessions/<id>/cancel` | Membatalkan sesi latihan kuis aktif | Perlu JWT |
| **Flashcard** | GET | `/api/v1/flashcards/progress` | Mengambil persentase penguasaan kosakata HSK | Perlu JWT |
| **Handwriting** | POST | `/api/v1/handwriting/recognize` | Mengunggah gambar kanvas dan inferensi AI | Bebas |
| **Handwriting** | GET | `/api/v1/handwriting/warmup` | Prapemanasan pemuatan model di memori server | Bebas |
| **Saved Chars** | GET | `/api/v1/saved-characters` | Mengambil daftar kosakata tersimpan milik user | Perlu JWT |
| **Saved Chars** | POST | `/api/v1/saved-characters` | Menyimpan karakter ke koleksi profil | Perlu JWT |
| **Saved Chars** | DELETE | `/api/v1/saved-characters/<id>` | Menghapus karakter dari koleksi profil | Perlu JWT |
| **Statistics** | GET | `/api/v1/stats/overview` | Ringkasan statistik performa belajar total | Perlu JWT |
| **Statistics** | GET | `/api/v1/stats/weekly` | Data aktivitas belajar 7 hari terakhir | Perlu JWT |
| **Statistics** | GET | `/api/v1/stats/daily` | Progres pencapaian target harian | Perlu JWT |
| **Statistics** | GET | `/api/v1/stats/history` | Riwayat sesi latihan kuis secara terpaginasi | Perlu JWT |

---

## 7. Metodologi Kecerdasan Buatan (AI Pipeline)

Modul pengenalan tulisan tangan bekerja dengan alur bertahap:

1. **Kanvas Interaktif:** Pengguna menggambar karakter pada kanvas web yang kemudian diubah menjadi citra digital.
2. **Normalisasi Citra:** Citra diubah menjadi ukuran $32 \times 32$ piksel dengan normalisasi tensor bernilai $[-1.0, 1.0]$.
3. **Ekstraksi Fitur Konvolusional:** ResNet Convolutional Backbone mengekstrak fitur visual spasial menjadi matriks representasi laten.
4. **Dekoder Urutan Goresan:** Transformer Decoder memprediksi sekuens kode goresan angka $1$ sampai $5$ secara bertahap (*autoregressive*).
5. **Koreksi Leksikal Levenshtein:** Sekuens goresan mentah dicocokkan dengan kamus 3.755 karakter GB2312. Jika terjadi salah goresan minor, algoritma Levenshtein Distance mengoreksinya ke pola paling mendekati.
6. **Resolusi Ambiguitas Visual:** Apabila satu sekuens goresan dimiliki oleh lebih dari satu karakter (*confusing characters*), fitur citra pengguna dikomparasi dengan fitur template SimSun dan SimFang menggunakan metrik Mean Squared Error (MSE) untuk menentukan karakter dengan galat visual terendah.

---

## 8. Verifikasi Kualitas dan Pengujian Sistem

Proyek ini telah melalui proses verifikasi perangkat lunak:
- **Linting Frontend:** Lulus pengujian ESLint (`npm run lint`) dengan **0 Error dan 0 Warning**.
- **Build Produksi:** Lulus kompilasi Vite (`npm run build`) dalam waktu 1.26 detik.
- **Integritas Basis Data:** Seluruh 9 tabel tersinkronisasi tanpa pelanggaran relasi kunci asing (*foreign key constraints*).
- **Pengujian Inferensi AI:** Teruji mengenali karakter dengan tingkat keyakinan hingga 98.4% dan waktu inferensi di bawah 300 ms pada lingkungan CPU.

---

## 9. Hak Cipta dan Lisensi

Hak Cipta (c) 2026. Dikembangkan sebagai karya penelitian tugas akhir (skripsi) program studi Informatika / Ilmu Komputer. Seluruh konten leksikal CC-CEDICT dilisensikan di bawah lisensi *Creative Commons Attribution-Share Alike 4.0*.
