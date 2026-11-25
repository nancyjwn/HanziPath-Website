# Dokumentasi Arsitektur Proyek ChineseLearning

Proyek ini adalah platform pembelajaran Bahasa Mandarin interaktif berbasis web yang memadukan **Kecerdasan Buatan (Deep Learning)** untuk pengenalan tulisan tangan Mandarin (*Chinese Character Recognition*), kamus digital CC-CEDICT, kurikulum HSK (1–6), serta modul flashcard adaptif berbasis **Spaced Repetition System (Sistem Leitner)**.

---

## 1. Struktur Folder Proyek

```text
ChineseLearning/
├── backend/
│   ├── ai_model/               # Modul AI Pengenalan Tulisan Tangan
│   │   ├── data/               # Kamus goresan (decompose-stroke-3755.txt)
│   │   ├── model/              # Arsitektur Transformer (transformer.py)
│   │   ├── templates/          # Fitur visual font template (simsun.pkl, simfang.pkl)
│   │   ├── weights/            # Checkpoint bobot terlatih (best_model.pth)
│   │   ├── config.py           # Konfigurasi model & dataset
│   │   ├── inference.py        # Pipeline inferensi Zero-Shot CCR
│   │   └── util.py             # Normalisasi & koreksi urutan goresan
│   ├── app/                    # Aplikasi Flask REST API
│   │   ├── models/             # Definisi skema ORM SQLAlchemy
│   │   ├── routes/             # Blueprint endpoint API
│   │   │   ├── auth.py         # Autentikasi pengguna & JWT
│   │   │   ├── dictionary.py   # Pencarian kamus CC-CEDICT
│   │   │   ├── hsk.py          # Daftar kosakata HSK 1-6
│   │   │   ├── daily_word.py   # Kata harian (WITA / Asia/Makassar)
│   │   │   ├── flashcard.py    # Kuis flashcard & sistem Leitner Box 1-5
│   │   │   ├── handwriting.py  # Endpoint inferensi gambar tulisan tangan
│   │   │   ├── saved_character.py # Simpan / bookmark karakter
│   │   │   └── statistics.py   # Statistik akurasi & progres kartu pengguna
│   │   ├── extensions.py       # Inisialisasi db, cors, jwt
│   │   └── __init__.py         # Application factory
│   ├── config.py               # Konfigurasi aplikasi & database connection
│   ├── check_models.py         # Skrip verifikasi tabel & koneksi DB
│   ├── run.py                  # Entry point Flask server
│   └── requirements.txt        # Dependensi Python backend
├── ChineseLearningDataset/
│   ├── cedict_1_0_ts_utf-8_mdbg.txt # Master data CC-CEDICT
│   ├── hsk-study-guide/        # CSV kosakata HSK level 1 sampai 6
│   ├── ImportDataset/          # Skrip ETL dan pemetaan data ke PostgreSQL
│   ├── QueryDatabase/          # DDL skema relasional, konstrain, indeks
│   └── .env                    # Variabel environment & kredensial DB
└── frontend/
    ├── src/
    │   ├── assets/             # Aset visual tema oriental
    │   ├── components/         # Komponen UI modular
    │   ├── context/            # Context state (Auth, Flashcard, dll.)
    │   ├── layouts/            # Layout halaman
    │   ├── pages/              # Halaman-halaman aplikasi
    │   ├── services/           # Konfigurasi HTTP client (Axios)
    │   ├── styles/             # Berkas gaya tambahan
    │   ├── App.jsx             # Halaman utama (Landing Page)
    │   └── index.css           # Konfigurasi token tema Tailwind CSS v4
    └── package.json            # React 19 + Vite + Tailwind CSS v4
```

---

## 2. Rincian Teknis Modul Utama

### A. Modul AI (Zero-Shot Stroke-Based Chinese Character Recognition)
* **Konsep**: Memprediksi urutan goresan (*stroke sequence*) dari gambar input pengguna menggunakan model Transformer, kemudian mencocokkannya ke 3.755 karakter standar.
* **Disambiguasi Karakter**: Karakter yang memiliki pola goresan identik (*confusing strokes*) dibedakan melalui perbandingan jarak MSE (*Mean Squared Error*) vektor fitur visual gambar terhadap template font *SimSun* dan *SimFang*.
* **Hasil**: Menghasilkan karakter Hanzi, urutan goresan, dan otomatis memanggil arti dari tabel kamus.

### B. Modul Flashcard & Leitner Spaced Repetition (SRS)
* **Tingkat Kotak (Box 1–5)**:
  * Box 1: Interval review 1 hari
  * Box 2: Interval review 3 hari
  * Box 3: Interval review 7 hari
  * Box 4: Interval review 14 hari
  * Box 5: Interval review 30 hari
* **Mekanisme**:
  * Jawaban benar $\rightarrow$ level naik 1 tingkat ($\le 5$).
  * Jawaban salah $\rightarrow$ kembali ke Box 1.
* **Evaluasi Fleksibel**: Menerima Pinyin bertanda nada (`nǐ hǎo`) maupun Pinyin berangka (`ni3 hao3` atau `ni3hao3`).

### C. Modul Kata Harian (Daily Words)
* Menghasilkan 3 kata HSK unik per hari dengan zona waktu **Asia/Makassar (WITA / UTC+8)**.
* Dilindungi oleh *PostgreSQL Advisory Lock* dan aturan anti-duplikasi selama 30 hari.

### D. Basis Data PostgreSQL
* `users`: Akun pengguna dan kata sandi yang telah di-hash.
* `dictionary_entries`: Master kamus CC-CEDICT (Hanzi Sederhana, Tradisional, Pinyin, Makna bahasa Inggris).
* `hsk_words`: Relasi kata ke level HSK 1–6.
* `saved_characters`: Riwayat karakter yang disimpan oleh pengguna dari berbagai modul.
* `quiz_sessions`, `quiz_session_questions`, `quiz_answers`: Riwayat dan evaluasi sesi latihan.
* `card_progress`: Kondisi progres kartu belajar di kotak Leitner untuk setiap pengguna.
* `daily_words`: Riwayat 3 kata harian per tanggal.

---

## 3. Rencana Pengembangan Selanjutnya (Frontend Integration)
1. Pembuatan halaman Autentikasi (Login & Registrasi) terhubung ke `/api/v1/auth`.
2. Kanvas interaktif tulisan tangan terhubung ke `/api/v1/handwriting/recognize`.
3. Antarmuka pencarian kamus terhubung ke `/api/v1/dictionary`.
4. Antarmuka flashcard interaktif terhubung ke `/api/v1/flashcards`.
5. Dashboard analitik & progres belajar terhubung ke `/api/v1/statistics`.

