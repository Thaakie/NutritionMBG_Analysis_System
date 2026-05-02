# NutriSafety AI — Flowchart Sistem (Mermaid)

## 1. Arsitektur Sistem

```mermaid
graph LR
    subgraph Frontend["Frontend (React + Vite :5173)"]
        UI["Dashboard UI"]
        AKG_FE["AKG Profiles"]
        API_SVC["API Service"]
    end

    subgraph Backend["Backend (Express :3000)"]
        REST["REST API"]
        DB_MOD["DB Module"]
    end

    subgraph AIEngine["AI Engine (Flask :5001)"]
        VALIDATE["Validator"]
        OPTIMIZER["PuLP Optimizer"]
        AKG_PY["AKG Profiles"]
    end

    subgraph Database["PostgreSQL"]
        TBL_FOODS["Tabel: foods"]
        TBL_HIST["Tabel: optimization_history"]
    end

    subgraph DataSource["Sumber Data"]
        CSV["Kaggle CSV - TKPI"]
        PERMENKES["Permenkes No.28/2019"]
    end

    UI --> API_SVC
    API_SVC --> REST
    REST --> DB_MOD
    DB_MOD --> TBL_FOODS
    DB_MOD --> TBL_HIST
    REST --> VALIDATE
    VALIDATE --> OPTIMIZER
    OPTIMIZER --> AKG_PY
    CSV -.->|seed script| TBL_FOODS
    PERMENKES -.->|hardcoded| AKG_FE
    PERMENKES -.->|hardcoded| AKG_PY
```

---

## 2. Alur Utama End-to-End

```mermaid
flowchart TD
    START(["User buka dashboard"]) --> LOAD_DB["Frontend fetch GET /api/foods"]
    LOAD_DB --> DB_QUERY["Backend query PostgreSQL"]
    DB_QUERY --> SHOW_TABLE["Tampilkan 1.345 bahan dalam tabel berpaginasi"]

    SHOW_TABLE --> SEARCH{"User cari / filter?"}
    SEARCH -->|Ya| FILTER["Filter by nama / kategori"]
    FILTER --> SELECT
    SEARCH -->|Tidak| SELECT["User centang bahan ✓"]

    SELECT --> SET_PARAMS["User atur parameter"]
    SET_PARAMS --> PARAM_DETAIL["Kelompok usia + Budget + Jumlah siswa"]
    PARAM_DETAIL --> AUTO_TARGET["Target AKG otomatis dihitung dari usia × 30%"]

    AUTO_TARGET --> PREVIEW["Preview real-time: total nutrisi, AKG%, status"]

    PREVIEW --> RUN{"User klik Run AI Optimization?"}
    RUN -->|Tidak| SELECT
    RUN -->|Ya| SEND["Frontend kirim payload ke POST /api/optimize"]

    SEND --> BACKEND["Backend validasi + forward ke AI Engine"]
    BACKEND --> AI["AI Engine terima & validasi payload"]
    AI --> SOLVE["PuLP solve Linear Programming"]

    SOLVE --> RESULT{"Solusi ditemukan?"}
    RESULT -->|Ya| RANK["Ranking 3 alternatif menu"]
    RESULT -->|Tidak| FALLBACK{"Ada excluded_menus?"}

    FALLBACK -->|Ya| RETRY["Coba ulang tanpa exclusion"]
    RETRY --> RESULT2{"Solusi ditemukan?"}
    RESULT2 -->|Ya| RANK
    RESULT2 -->|Tidak| INFEASIBLE["Return: Tidak layak / infeasible"]

    FALLBACK -->|Tidak| INFEASIBLE

    RANK --> SAVE["Simpan hasil ke PostgreSQL"]
    SAVE --> RETURN["Return hasil ke frontend"]
    RETURN --> DISPLAY["Tampilkan rekomendasi menu + AKG% + alternatif"]
    INFEASIBLE --> RETURN
```

---

## 3. Proses Optimasi AI (Detail)

```mermaid
flowchart TD
    INPUT["Terima: foods, budget, min_calories, min_protein, excluded_menus"] --> SCORE["Hitung skor setiap bahan"]

    SCORE --> FORMULA["skor = protein×5 + kalori×0.03 + lemak×0.7 + karbo×0.04 - harga×0.001 + bonus_kategori"]

    FORMULA --> INIT["Inisialisasi iterasi = 1"]

    INIT --> LP["Formulasi LP: max Σ xi × skori"]

    LP --> C1["Constraint 1: Σ xi × hargai ≤ budget"]
    LP --> C2["Constraint 2: Σ xi × kalorii ≥ min_kalori"]
    LP --> C3["Constraint 3: Σ xi × proteini ≥ min_protein"]
    LP --> C4["Constraint 4: Makanan Pokok ≥ 1, Lauk ≥ 1, Sayur ≥ 1"]
    LP --> C5["Constraint 5: Menu sebelumnya dihindari"]

    C1 --> SOLVE["CBC Solver solve"]
    C2 --> SOLVE
    C3 --> SOLVE
    C4 --> SOLVE
    C5 --> SOLVE

    SOLVE --> OPTIMAL{"Status = Optimal?"}
    OPTIMAL -->|Ya| EXTRACT["Ambil bahan terpilih xi = 1"]
    OPTIMAL -->|Tidak| DONE["Selesai iterasi"]

    EXTRACT --> BUILD["Hitung total nutrisi + AKG% + status kelayakan"]
    BUILD --> SAVE_ALT["Simpan sebagai alternatif ke-N"]
    SAVE_ALT --> EXCLUDE["Tambahkan menu ini ke excluded"]

    EXCLUDE --> NEXT{"Iterasi < 3?"}
    NEXT -->|Ya| LP
    NEXT -->|Tidak| DONE

    DONE --> SORT["Urutkan alternatif: Layak > Perlu optimasi > Tidak layak"]
    SORT --> BEST["Alternatif rank-1 = rekomendasi utama"]
```

---

## 4. Perhitungan AKG dan Klasifikasi

```mermaid
flowchart TD
    AGE["Kelompok usia dipilih: misal 7-9 tahun"] --> DAILY["AKG Harian: 1.650 kcal, 40g protein, 55g lemak, 250g karbo"]

    DAILY --> SHARE["MBG = 30% AKG harian"]
    SHARE --> TARGET["Target per porsi: 495 kcal, 12g protein, 16.5g lemak, 75g karbo"]

    TARGET --> CALC["Hitung AKG% = total_menu / target × 100"]

    CALC --> CHECK_CAL{"AKG kalori ≥ 100% DAN AKG protein ≥ 100%?"}

    CHECK_CAL -->|Ya| CHECK_BUDGET{"Biaya ≤ budget?"}
    CHECK_CAL -->|Tidak| CHECK_80{"AKG kalori ≥ 80% DAN AKG protein ≥ 80%?"}

    CHECK_BUDGET -->|Ya| CHECK_MACRO{"AKG lemak ≥ 80% DAN AKG karbo ≥ 80%?"}
    CHECK_BUDGET -->|Tidak| TIDAK_LAYAK["Status: Tidak layak"]

    CHECK_MACRO -->|Ya| LAYAK["Status: Layak ✅"]
    CHECK_MACRO -->|Tidak| PERLU["Status: Perlu optimasi ⚠️"]

    CHECK_80 -->|Ya| CHECK_BUDGET2{"Biaya ≤ budget?"}
    CHECK_80 -->|Tidak| TIDAK_LAYAK

    CHECK_BUDGET2 -->|Ya| PERLU
    CHECK_BUDGET2 -->|Tidak| TIDAK_LAYAK
```

---

## 5. Alur CRUD Bahan Makanan

```mermaid
flowchart TD
    subgraph Dashboard["Panel Daftar Bahan Makanan"]
        SEARCH["Search bar + filter kategori"]
        TABLE["Tabel berpaginasi 50/halaman"]
        CHECK["Checkbox pilih bahan"]
        FORM["Form tambah/edit bahan"]
    end

    SEARCH --> TABLE
    TABLE --> CHECK
    CHECK -->|Centang| SELECTED["Bahan masuk kandidat optimasi"]

    FORM -->|Tambah| CREATE["POST /api/foods"]
    FORM -->|Edit| UPDATE["PUT /api/foods/:id"]
    TABLE -->|Hapus| DELETE["DELETE /api/foods/:id"]

    CREATE --> REFRESH["Refresh tabel dari database"]
    UPDATE --> REFRESH
    DELETE --> REFRESH

    REFRESH --> TABLE

    subgraph Dataset["Sample Datasets"]
        PRESET["Elementary / Middle / Senior"]
    end

    PRESET -->|Load Dataset| INSERT_DB["Insert bahan ke database via API"]
    INSERT_DB --> REFRESH
    INSERT_DB --> AUTO_SELECT["Auto-centang bahan dataset"]
```

---

## 6. Alur Data Seed dari CSV

```mermaid
flowchart LR
    CSV["nutrition.csv - 1.346 bahan TKPI"] --> READ["seed-foods.js membaca CSV"]
    READ --> PARSE["Parse: id, calories, proteins, fat, carbohydrate, name"]
    PARSE --> CATEGORY["Auto-detect kategori dari nama"]
    CATEGORY --> INSERT["INSERT ke tabel foods di PostgreSQL"]
    INSERT --> DB["Database: 1.345 bahan siap dipakai"]

    MANUAL["User input manual via form"] --> API["POST /api/foods"]
    API --> DB
```

---

## Cara Pakai

Copy-paste syntax mermaid di atas ke:
- **Mermaid Live Editor**: https://mermaid.live
- **Markdown viewer** yang support mermaid (GitHub, Notion, dll)
- **draw.io**: import mermaid code
- **VS Code**: install extension "Markdown Preview Mermaid Support"
