# NutriSafety

NutriSafety adalah aplikasi fullstack untuk membantu menyusun rekomendasi menu makanan berdasarkan target gizi dan batas anggaran. Sistem ini memadukan:

- Frontend React untuk input data dan visualisasi hasil
- Backend Node.js/Express sebagai API penghubung
- AI Engine Python/Flask untuk proses optimasi menu

Project ini berfokus pada simulasi pemilihan menu yang memenuhi kebutuhan energi dan protein minimum untuk kelompok usia tertentu, dengan acuan profil AKG per porsi makan.

---

# Arsitektur Sistem

```text
Frontend (React + Vite)
        |
        | HTTP request
        v
Backend API (Node.js + Express)
        |
        | HTTP request
        v
AI Engine (Python + Flask + PuLP)
        |
        v
Hasil optimasi menu + ringkasan nutrisi
```

---

# Fitur Utama

- Mengatur batas anggaran menu
- Memilih kelompok usia: `7-9`, `10-12`, `13-15`, `16-18`
- Menghitung target minimum kalori dan protein berdasarkan profil AKG
- Menambah dan menghapus item makanan secara manual
- Menggunakan dataset contoh untuk simulasi cepat
- Mengirim payload optimasi ke backend
- Menghasilkan menu rekomendasi beserta alternatif peringkat
- Menampilkan total kalori, protein, lemak, karbohidrat, biaya, dan status kelayakan

---

# Struktur Project

```text
TESTING/
|-- ai-engine/
|   |-- app.py
|   |-- optimizer.py
|   |-- akg_profiles.py
|   |-- requirement.txt
|   `-- .gitignore
|
|-- backend/
|   |-- server.js
|   |-- package.json
|   |-- package-lock.json
|   `-- .gitignore
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- data/
|   |   |-- utils/
|   |   `-- styles/
|   |-- public/
|   |-- package.json
|   |-- vite.config.js
|   `-- .gitignore
|
|-- learning-notes/
`-- Readme.txt
```

---

# Teknologi yang Digunakan

## Frontend

- React 19
- Vite
- CSS

## Backend

- Node.js
- Express
- Axios
- CORS

## AI Engine

- Python
- Flask
- Pandas
- PuLP

---

# Endpoint Utama

## Backend

- `GET /`
  Mengecek apakah backend aktif
- `GET /api/health`
  Mengecek kesehatan backend dan AI engine
- `GET /api/akg-profiles`
  Mengambil profil AKG dari AI engine
- `POST /api/optimize`
  Mengirim data makanan dan constraint untuk dioptimasi

## AI Engine

- `GET /health`
  Mengecek status AI engine
- `GET /akg-profiles`
  Mengambil daftar profil AKG yang didukung
- `POST /optimize`
  Menjalankan optimasi menu

---

# Cara Menjalankan Project

## 1. Jalankan AI Engine

```powershell
cd ai-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirement.txt
python app.py
```

AI engine default berjalan di:

```text
http://localhost:5001
```

## 2. Jalankan Backend

```powershell
cd backend
npm install
node server.js
```

Backend default berjalan di:

```text
http://localhost:3000
```

Backend akan meneruskan request optimasi ke AI engine melalui:

```text
AI_ENGINE_URL=http://localhost:5001
```

## 3. Jalankan Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend default berjalan di:

```text
http://localhost:5173
```

---

# Format Data Makanan

Setiap makanan yang dikirim untuk optimasi memiliki struktur:

```json
{
  "name": "Ayam",
  "portion_grams": 60,
  "protein": 18,
  "calories": 240,
  "fat": 14,
  "carbs": 0,
  "price": 8000
}
```

Payload optimasi dikirim dalam bentuk:

```json
{
  "budget": 15000,
  "age_group": "7-9",
  "minimum_calories": 495,
  "minimum_protein": 12,
  "foods": []
}
```

---

# Logika Optimasi

AI engine menggunakan `PuLP` untuk memilih kombinasi makanan terbaik dengan constraint:

- total biaya tidak melebihi budget
- total kalori memenuhi minimum
- total protein memenuhi minimum

Sistem juga menghitung:

- persentase capaian AKG per makan
- status anggaran
- status kelayakan menu
- alternatif menu peringkat 1 sampai 3 jika tersedia

Status kelayakan yang digunakan:

- `Layak`
- `Perlu optimasi`
- `Tidak layak`

---

# Catatan

- Profil AKG saat ini menggunakan referensi prototipe yang disejajarkan dengan `Permenkes No. 28 Tahun 2019`
- File environment seperti `venv/` dan dependency folder seperti `node_modules/` sudah seharusnya tidak ikut ke Git
- Folder `learning-notes/` berisi catatan pembelajaran dan penjelasan sistem

---

# Lisensi

Project ini digunakan untuk kebutuhan pembelajaran, eksperimen, dan pengembangan prototipe.
