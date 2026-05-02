import { useCallback, useEffect, useMemo, useState } from "react";
import "./FoodDatabasePanel.css";
import { foodCategoryOptions } from "../data/foodCategories";
import { createFoodInDb, deleteFoodFromDb, fetchFoods, updateFoodInDb } from "../services/api";
import { formatNumber } from "../utils/formatters";

const emptyForm = {
  name: "",
  category: "Lainnya",
  portion_grams: "",
  protein: "",
  calories: "",
  fat: "",
  carbs: "",
  price: "",
};

const PAGE_SIZE = 50;

function parseNum(val) {
  if (val === "" || val === undefined || val === null) return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function mapDbToOptimizer(food) {
  return {
    id: food.id,
    name: food.name,
    category: food.category || "Lainnya",
    portionScale: "custom",
    portionGrams: parseNum(food.portion_grams),
    protein: parseNum(food.protein),
    calories: parseNum(food.calories),
    fat: parseNum(food.fat),
    carbs: parseNum(food.carbs),
    price: parseNum(food.price),
  };
}

function FoodDatabasePanel({ onSelectionChange, datasetToLoad, onDatasetLoaded }) {
  const [dbFoods, setDbFoods] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [page, setPage] = useState(0);

  const notifySelection = useCallback(
    (foods, ids) => {
      const selected = foods.filter((f) => ids.has(f.id)).map(mapDbToOptimizer);
      onSelectionChange(selected);
    },
    [onSelectionChange],
  );

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(dbFoods.map((f) => f.category || "Lainnya"));
    return ["Semua", ...Array.from(cats).sort()];
  }, [dbFoods]);

  // Filtered foods (search + category)
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return dbFoods.filter((f) => {
      const matchCat = categoryFilter === "Semua" || f.category === categoryFilter;
      const matchSearch = !query || f.name.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [dbFoods, search, categoryFilter]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, categoryFilter]);

  const loadFoods = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const items = await fetchFoods();
      setDbFoods(items);
      return items;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load — nothing checked
  useEffect(() => { loadFoods(); }, [loadFoods]);

  // Handle dataset loading from parent
  useEffect(() => {
    if (!datasetToLoad) return;
    async function insertDataset() {
      setError("");
      setSuccess("");
      const names = datasetToLoad.foods.map((f) => f.name);
      for (const food of datasetToLoad.foods) {
        try {
          await createFoodInDb({
            name: food.name,
            category: food.category || "Lainnya",
            portion_grams: food.portionGrams,
            protein: food.protein,
            calories: food.calories,
            fat: food.fat,
            carbs: food.carbs,
            price: food.price,
          });
        } catch { /* skip duplicates */ }
      }
      const items = await loadFoods();
      const newIds = new Set(items.filter((f) => names.includes(f.name)).map((f) => f.id));
      setSelectedIds(newIds);
      notifySelection(items, newIds);
      setSuccess(`Dataset "${datasetToLoad.name}" dimuat ke database.`);
      onDatasetLoaded();
    }
    insertDataset();
  }, [datasetToLoad, loadFoods, notifySelection, onDatasetLoaded]);

  function toggleFood(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      notifySelection(dbFoods, next);
      return next;
    });
  }

  function toggleFiltered() {
    const filteredIds = filtered.map((f) => f.id);
    const allSelected = filteredIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      notifySelection(dbFoods, next);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    notifySelection(dbFoods, new Set());
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((c) => ({ ...c, [name]: value }));
  }

  function startEditing(food) {
    setEditingId(food.id);
    setForm({
      name: food.name,
      category: food.category || "Lainnya",
      portion_grams: String(food.portion_grams),
      protein: String(food.protein),
      calories: String(food.calories),
      fat: String(food.fat),
      carbs: String(food.carbs),
      price: String(food.price),
    });
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function buildPayload() {
    const trimmedName = form.name.trim();
    if (!trimmedName) return { error: "Nama bahan tidak boleh kosong." };
    const fields = ["portion_grams", "protein", "calories", "fat", "carbs", "price"];
    const parsed = {};
    for (const field of fields) {
      const raw = form[field];
      if (raw === "" || raw === undefined) return { error: `${field} tidak boleh kosong.` };
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) return { error: `${field} harus angka >= 0.` };
      parsed[field] = value;
    }
    return { data: { name: trimmedName, category: form.category || "Lainnya", ...parsed } };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const result = buildPayload();
    if (result.error) { setError(result.error); return; }
    try {
      if (editingId) {
        await updateFoodInDb(editingId, result.data);
        setSuccess(`"${result.data.name}" diperbarui.`);
        setEditingId(null);
      } else {
        const created = await createFoodInDb(result.data);
        setSuccess(`"${result.data.name}" ditambahkan.`);
        setSelectedIds((prev) => { const next = new Set(prev); next.add(created.id); return next; });
      }
      setForm(emptyForm);
      const items = await loadFoods();
      notifySelection(items, selectedIds);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(food) {
    setError("");
    setSuccess("");
    try {
      await deleteFoodFromDb(food.id);
      setSuccess(`"${food.name}" dihapus.`);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(food.id); return next; });
      const items = await loadFoods();
      notifySelection(items, selectedIds);
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredAllChecked = filtered.length > 0 && filtered.every((f) => selectedIds.has(f.id));

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Daftar Bahan Makanan</h2>
        <p>
          Kelola bahan di database dan centang bahan yang akan dioptimasi oleh AI.
          <strong> {selectedIds.size} bahan dipilih</strong> dari {dbFoods.length} total.
        </p>
      </div>

      {/* Search + Category filter */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Cari bahan..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="category-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat} {cat !== "Semua" ? `(${dbFoods.filter(f => f.category === cat).length})` : `(${dbFoods.length})`}</option>
          ))}
        </select>
      </div>

      {/* Action toolbar */}
      <div className="database-toolbar">
        <button className="secondary-button" disabled={isLoading} onClick={() => loadFoods()} type="button">
          {isLoading ? "Memuat..." : "Refresh"}
        </button>
        <button className="secondary-button" onClick={toggleFiltered} type="button">
          {filteredAllChecked ? `Hapus centang (${filtered.length})` : `Pilih semua (${filtered.length})`}
        </button>
        {selectedIds.size > 0 && (
          <button className="table-button" onClick={clearSelection} type="button">
            Reset pilihan
          </button>
        )}
        <span className="selection-count">
          Menampilkan {filtered.length} dari {dbFoods.length} bahan
        </span>
      </div>

      {error ? <p className="feedback error">{error}</p> : null}
      {success ? <p className="feedback success-feedback">{success}</p> : null}

      {filtered.length === 0 && !isLoading ? (
        <div className="empty-state">
          <p>{dbFoods.length === 0 ? "Belum ada bahan di database." : "Tidak ada bahan yang cocok dengan pencarian."}</p>
        </div>
      ) : (
        <>
          <div className="food-db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" checked={filteredAllChecked && filtered.length > 0} onChange={toggleFiltered} /></th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Porsi</th>
                  <th>Protein</th>
                  <th>Kalori</th>
                  <th>Lemak</th>
                  <th>Karbo</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((food) => (
                  <tr key={food.id} className={selectedIds.has(food.id) ? "row-selected" : ""}>
                    <td><input type="checkbox" checked={selectedIds.has(food.id)} onChange={() => toggleFood(food.id)} /></td>
                    <td>{food.name}</td>
                    <td><span className="cat-badge">{food.category || "Lainnya"}</span></td>
                    <td>{formatNumber(food.portion_grams)} g</td>
                    <td>{formatNumber(food.protein)} g</td>
                    <td>{formatNumber(food.calories)} kcal</td>
                    <td>{formatNumber(food.fat)} g</td>
                    <td>{formatNumber(food.carbs)} g</td>
                    <td>Rp {formatNumber(food.price)}</td>
                    <td>
                      <div className="action-cell">
                        <button className="table-button" onClick={() => startEditing(food)} type="button">Edit</button>
                        <button className="table-button" onClick={() => handleDelete(food)} type="button">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="table-button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} type="button">← Prev</button>
              <span className="page-info">Halaman {safePage + 1} dari {totalPages}</span>
              <button className="table-button" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} type="button">Next →</button>
            </div>
          )}
        </>
      )}

      <details className="add-food-details">
        <summary className="add-food-summary">{editingId ? `Mengedit: ${form.name}` : "Tambah bahan baru"}</summary>
        <form className="menu-form" onSubmit={handleSubmit}>
          <div className="input-grid">
            <label>
              <span>Nama bahan</span>
              <input name="name" placeholder="Contoh: Telur" value={form.name} onChange={handleFormChange} />
            </label>
            <label>
              <span>Kategori</span>
              <select name="category" value={form.category} onChange={handleFormChange}>
                {foodCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Porsi (gram)</span>
              <input min="0" name="portion_grams" placeholder="100" type="number" step="any" value={form.portion_grams} onChange={handleFormChange} />
            </label>
            <label>
              <span>Protein (g)</span>
              <input min="0" name="protein" placeholder="12" type="number" step="any" value={form.protein} onChange={handleFormChange} />
            </label>
            <label>
              <span>Kalori</span>
              <input min="0" name="calories" placeholder="150" type="number" step="any" value={form.calories} onChange={handleFormChange} />
            </label>
            <label>
              <span>Lemak (g)</span>
              <input min="0" name="fat" placeholder="6" type="number" step="any" value={form.fat} onChange={handleFormChange} />
            </label>
            <label>
              <span>Karbohidrat (g)</span>
              <input min="0" name="carbs" placeholder="18" type="number" step="any" value={form.carbs} onChange={handleFormChange} />
            </label>
            <label>
              <span>Harga (Rp)</span>
              <input min="0" name="price" placeholder="3500" type="number" step="any" value={form.price} onChange={handleFormChange} />
            </label>
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit">{editingId ? "Simpan Perubahan" : "Tambah ke Database"}</button>
            {editingId ? <button className="table-button" onClick={cancelEditing} type="button">Batal</button> : null}
          </div>
        </form>
      </details>
    </section>
  );
}

export default FoodDatabasePanel;
