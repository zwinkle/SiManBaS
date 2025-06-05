# Sistem Manajemen Bank Soal Kolaboratif (SiManBaS)

Sistem Manajemen Bank Soal Kolaboratif (SiManBaS) adalah aplikasi web yang dirancang untuk membantu institusi pendidikan atau kelompok pengajar dalam membuat, mengelola, dan menganalisis kualitas soal secara kolaboratif. Aplikasi ini menggunakan Teori Tes Klasik (Classical Test Theory - CTT) untuk analisis item dasar.

Proyek ini dibangun menggunakan FastAPI untuk backend, PostgreSQL sebagai database, dan React.js untuk frontend.

## Fitur Utama

* **Manajemen Pengguna:** Registrasi dan login untuk pengajar/administrator.
* **Manajemen Bank Soal:**
    * Membuat, membaca, memperbarui, dan menghapus soal (CRUD).
    * Mendukung berbagai tipe soal (misalnya, Pilihan Ganda, Esai Singkat).
    * Kategorisasi soal berdasarkan mata pelajaran, topik, dan estimasi tingkat kesulitan awal.
* **Input Respons Siswa:** Kemampuan untuk mengunggah atau memasukkan data respons siswa terhadap soal-soal yang telah digunakan.
* **Analisis Kualitas Item Dasar (CTT):**
    * Perhitungan Indeks Tingkat Kesulitan (P-value).
    * Perhitungan Indeks Daya Pembeda.
* **Visualisasi Hasil Analisis:** Penyajian hasil analisis item dalam bentuk yang mudah dipahami (misalnya, tabel dan grafik).
* **(Opsional/Fitur Masa Depan):** Fitur kolaborasi yang lebih mendalam seperti review soal bersama, komentar, dan versioning soal.

## Tech Stack

* **Backend:** Python 3.9+, FastAPI, Uvicorn, SQLAlchemy, Pydantic, Alembic (untuk migrasi database)
* **Database:** PostgreSQL 13+
* **Frontend:** Node.js 18+, React.js 18+, (Pilih salah satu: TailwindCSS v3 atau Ant Design v5), Axios, Chart.js (atau library visualisasi lainnya)
* **Version Control:** Git

## Prasyarat

Pastikan perangkat lunak berikut sudah terinstal di sistem Anda:

* Python (versi 3.9 atau lebih tinggi) & Pip
* Node.js (versi 18 atau lebih tinggi) & NPM (versi 9 atau lebih tinggi) atau Yarn
* PostgreSQL (versi 13 atau lebih tinggi)
* Git
* (Opsional, jika ingin menjalankan dengan Docker di kemudian hari) Docker & Docker Compose

## Struktur Folder
```
[NAMA_FOLDER_REPOSITORY]/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app instance, main router
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Settings (Pydantic BaseSettings)
│   │   │   └── security.py           # Password hashing, JWT logic
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── session.py            # Database engine, SessionLocal
│   │   │   ├── base.py               # DeclarativeBase for SQLAlchemy models
│   │   │   └── init_db.py            # (Opsional) Script inisialisasi data awal
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── answer_option.py
│   │   │   ├── student_response.py
│   │   │   └── item_analysis_result.py
│   │   ├── schemas/                  # Pydantic schemas (untuk validasi & serialisasi)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── answer_option.py
│   │   │   ├── student_response.py
│   │   │   ├── item_analysis_result.py
│   │   │   └── token.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── api.py              # Main API router v1 (aggregates endpoint routers)
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── questions.py
│   │   │           ├── responses.py
│   │   │           └── analysis.py
│   │   ├── crud/                     # CRUD operations (interaksi database)
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base CRUD class (opsional)
│   │   │   ├── crud_user.py
│   │   │   ├── crud_question.py
│   │   │   ├── crud_answer_option.py
│   │   │   ├── crud_student_response.py
│   │   │   └── crud_item_analysis_result.py
│   │   └── services/                 # Logika bisnis yang lebih kompleks
│   │       ├── __init__.py
│   │       └── item_analysis_service.py
│   ├── tests/                      # Folder untuk unit dan integration tests
│   │   └── ...
│   ├── alembic/                    # Folder untuk migrasi Alembic
│   │   └── ...
│   ├── alembic.ini                 # Konfigurasi Alembic
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile                  # (Akan dibuat nanti)
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── ... (favicon, manifest, etc.)
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── assets/                 # Gambar, font, style global
│   │   ├── components/             # Komponen UI reusable (Button, Card, Form, Table, Chart)
│   │   ├── contexts/               # React Context (misal, AuthContext)
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── layouts/                # Komponen layout utama (MainLayout, AuthLayout)
│   │   ├── pages/                  # Komponen untuk setiap halaman/route
│   │   ├── routes/                 # Konfigurasi routing (misal, AppRouter.js)
│   │   ├── services/               # Fungsi untuk memanggil API backend (authService.js, questionService.js)
│   │   └── utils/                  # Fungsi utilitas
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── yarn.lock (atau package-lock.json)
│   ├── jsconfig.json (atau tsconfig.json jika TypeScript)
│   └── Dockerfile                  # (Akan dibuat nanti)
│
├── .gitignore
├── README.md
└── docker-compose.yml            # (Akan dibuat nanti)

```

## Instalasi & Setup (Pengembangan Lokal)

1.  **Clone Repository:**
    ```bash
    git clone [URL_REPOSITORY_ANDA]
    cd [NAMA_FOLDER_REPOSITORY]
    ```

2.  **Setup Backend (FastAPI):**
    * Pindah ke direktori backend:
        ```bash
        cd backend
        ```
    * Buat dan aktifkan Python virtual environment:
        ```bash
        python -m venv venv
        # Windows
        .\venv\Scripts\activate
        # macOS/Linux
        source venv/bin/activate
        ```
    * Install dependensi Python:
        ```bash
        pip install -r requirements.txt
        ```
    * Buat file `.env` dari contoh. Salin `backend/.env.example` menjadi `backend/.env` dan sesuaikan konfigurasinya, terutama `DATABASE_URL` untuk koneksi ke PostgreSQL Anda dan `SECRET_KEY` untuk JWT.
        Contoh `DATABASE_URL`:
        `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
    * Setup Database:
        Pastikan server PostgreSQL Anda berjalan dan database yang sesuai dengan `.env` sudah dibuat.
    * Jalankan migrasi database (jika menggunakan Alembic):
        ```bash
        alembic upgrade head
        ```
    * Untuk menjalankan server backend FastAPI:
        ```bash
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ```
        API akan tersedia di `http://localhost:8000`.

3.  **Setup Frontend (React):**
    * Pindah ke direktori frontend (dari root proyek):
        ```bash
        cd frontend
        ```
    * Install dependensi JavaScript:
        ```bash
        # Menggunakan npm
        npm install
        # Atau menggunakan yarn
        yarn install
        ```
    * Buat file `.env` dari contoh. Salin `frontend/.env.example` menjadi `frontend/.env` dan sesuaikan URL API backend jika perlu (misalnya, `REACT_APP_API_BASE_URL=http://localhost:8000/api/v1`).
    * Untuk menjalankan server pengembangan frontend React:
        ```bash
        # Menggunakan npm
        npm start
        # Atau menggunakan yarn
        yarn start
        ```
        Aplikasi frontend akan tersedia di `http://localhost:3000` (atau port lain jika 3000 sudah terpakai).

## Menjalankan Aplikasi

Setelah backend dan frontend berjalan, Anda bisa mengakses aplikasi frontend melalui browser di `http://localhost:3000` (atau port yang sesuai). Frontend akan berkomunikasi dengan backend API di `http://localhost:8000`.

## (Opsional) Menjalankan dengan Docker

Instruksi untuk menjalankan aplikasi menggunakan Docker dan Docker Compose akan ditambahkan di sini jika dan ketika konfigurasi Docker sudah dibuat. Langkah umumnya adalah:

1.  Pastikan Docker & Docker Compose terinstal.
2.  Jalankan perintah dari root direktori proyek:
    ```bash
    docker-compose up --build
    ```

## Kontribusi

Kontribusi dalam bentuk *pull request* sangat diterima. Untuk perubahan besar, mohon buka *issue* terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.

## Lisensi

[MIT](https://choosealicense.com/licenses/mit/)