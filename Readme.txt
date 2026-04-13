# 🍽️ Smart Nutrition Menu Optimizer

Smart Nutrition Menu Optimizer adalah sistem berbasis **AI** yang membantu menghasilkan rekomendasi menu makanan optimal berdasarkan **kebutuhan gizi (AKG)** pengguna.

Sistem ini menggunakan pendekatan **fullstack architecture** yang terdiri dari:

* **Frontend** → React (User Interface)
* **Backend** → Node.js (API Server)
* **AI Engine** → Python (Optimization Engine)

Tujuan dari sistem ini adalah membantu pengguna menyusun menu makanan yang **seimbang secara nutrisi** dan **optimal berdasarkan kebutuhan gizi**.

---

# 🧠 System Architecture

```
Frontend (React)
        │
        │ HTTP Request
        ▼
Backend (Node.js API)
        │
        │ API Call
        ▼
AI Engine (Python Optimizer)
        │
        ▼
Optimized Nutrition Result
```

---

# 📂 Project Structure

```
project-root
│
├── ai-engine
│   ├── app.py
│   ├── optimizer.py
│   ├── akg_profiles.py
│   └── requirement.txt
│
├── backend
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── data
│   │   ├── utils
│   │   └── styles
│   │
│   └── vite.config.js
│
└── learning-notes
    ├── system-overview
    ├── frontend-concepts
    ├── backend-concepts
    └── ai-engine-concepts
```

---

# ⚙️ Technologies Used

### Frontend

* React
* Vite
* CSS

### Backend

* Node.js
* Express.js

### AI Engine

* Python
* Optimization Algorithm

---

# 🚀 Installation Guide

## 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/smart-nutrition-optimizer.git
cd smart-nutrition-optimizer
```

---

# 💻 Setup Frontend

```
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di:

```
http://localhost:5173
```

---

# 🔧 Setup Backend

```
cd backend
npm install
node server.js
```

Backend berjalan di:

```
http://localhost:3000
```

---

# 🤖 Setup AI Engine

Buat virtual environment terlebih dahulu:

```
cd ai-engine
python -m venv venv
```

Aktifkan environment:

Windows:

```
venv\Scripts\activate
```

Install dependency:

```
pip install -r requirement.txt
```

Jalankan AI engine:

```
python app.py
```

---

# 📊 Features

* Nutritional requirement analysis
* Menu optimization based on AKG
* Interactive user interface
* Dataset management
* Result visualization
* AI-powered optimization engine

---

# 📚 Learning Notes

Folder **learning-notes** berisi dokumentasi internal mengenai:

* System architecture
* Frontend implementation
* Backend communication
* AI optimization logic

---

# 🧑‍💻 Author

Developed by:

**Kiee**

---

# 📜 License

This project is open-source and available for educational purposes.
