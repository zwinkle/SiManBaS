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