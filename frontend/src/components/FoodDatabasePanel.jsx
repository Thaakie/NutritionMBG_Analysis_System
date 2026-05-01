import { useCallback, useEffect, useState } from "react";
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

function FoodDatabasePanel({ onAddToOptimizer, onLoadAllToOptimizer }) {
  const [dbFoods, setDbFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadFoods = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const items = await fetchFoods();
      setDbFoods(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEditing(food) {
    setEditingId(food.id);
    setForm({
      name: food.name,
      category: food.category || "Lainnya",
      portion_grams: food.portion_grams,
      protein: food.protein,
      calories: food.calories,
      fat: food.fat,
      carbs: food.carbs,
      price: food.price,
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
    if (!trimmedName) {
      return { error: "Nama bahan tidak boleh kosong." };
    }

    const numericFields = ["portion_grams", "protein", "calories", "fat", "carbs", "price"];
    const parsed = {};
    for (const field of numericFields) {
      const value = Number(form[field]);
      if (Number.isNaN(value) || value < 0) {
        return { error: `${field} harus berupa angka non-negatif.` };
      }
      parsed[field] = value;
    }

    return {
      data: {
        name: trimmedName,
        category: form.category || "Lainnya",
        ...parsed,
      },
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const result = buildPayload();
    if (result.error) {
      setError(result.error);
      return;
    }

    try {
      if (editingId) {
        await updateFoodInDb(editingId, result.data);
        setSuccess(`Bahan "${result.data.name}" berhasil diperbarui.`);
        setEditingId(null);
      } else {
        await createFoodInDb(result.data);
        setSuccess(`Bahan "${result.data.name}" berhasil ditambahkan.`);
      }

      setForm(emptyForm);
      await loadFoods();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(food) {
    setError("");
    setSuccess("");

    try {
      await deleteFoodFromDb(food.id);
      setSuccess(`Bahan "${food.name}" berhasil dihapus.`);
      await loadFoods();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleAddSingleToOptimizer(food) {
    onAddToOptimizer({
      id: Date.now(),
      name: food.name,
      category: food.category || "Lainnya",
      portionScale: "custom",
      portionGrams: Number(food.portion_grams),
      protein: Number(food.protein),
      calories: Number(food.calories),
      fat: Number(food.fat),
      carbs: Number(food.carbs),
      price: Number(food.price),
    });
    setSuccess(`"${food.name}" ditambahkan ke kandidat optimasi.`);
  }

  function handleLoadAll() {
    const mapped = dbFoods.map((food, index) => ({
      id: Date.now() + index,
      name: food.name,
      category: food.category || "Lainnya",
      portionScale: "custom",
      portionGrams: Number(food.portion_grams),
      protein: Number(food.protein),
      calories: Number(food.calories),
      fat: Number(food.fat),
      carbs: Number(food.carbs),
      price: Number(food.price),
    }));
    onLoadAllToOptimizer(mapped);
    setSuccess(`${mapped.length} bahan dari database dimuat ke kandidat optimasi.`);
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Database Bahan Makanan</h2>
        <p>Kelola data bahan makanan di database PostgreSQL. Bahan bisa ditambahkan langsung ke kandidat optimasi.</p>
      </div>

      <div className="database-toolbar">
        <button className="secondary-button" disabled={isLoading} onClick={loadFoods} type="button">
          {isLoading ? "Memuat..." : "Refresh Data"}
        </button>
        <button className="secondary-button" disabled={dbFoods.length === 0} onClick={handleLoadAll} type="button">
          Muat Semua ke Optimasi ({dbFoods.length})
        </button>
      </div>

      {error ? <p className="feedback error">{error}</p> : null}
      {success ? <p className="feedback success-feedback">{success}</p> : null}

      <form className="menu-form" onSubmit={handleSubmit}>
        {editingId ? <span className="edit-badge">Mengedit: {form.name}</span> : null}
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
            <input min="0" name="portion_grams" placeholder="60" type="number" value={form.portion_grams} onChange={handleFormChange} />
          </label>
          <label>
            <span>Protein (g)</span>
            <input min="0" name="protein" placeholder="12" type="number" value={form.protein} onChange={handleFormChange} />
          </label>
          <label>
            <span>Kalori</span>
            <input min="0" name="calories" placeholder="150" type="number" value={form.calories} onChange={handleFormChange} />
          </label>
          <label>
            <span>Lemak (g)</span>
            <input min="0" name="fat" placeholder="6" type="number" value={form.fat} onChange={handleFormChange} />
          </label>
          <label>
            <span>Karbohidrat (g)</span>
            <input min="0" name="carbs" placeholder="18" type="number" value={form.carbs} onChange={handleFormChange} />
          </label>
          <label>
            <span>Harga (Rp)</span>
            <input min="0" name="price" placeholder="3500" type="number" value={form.price} onChange={handleFormChange} />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            {editingId ? "Simpan Perubahan" : "Tambah ke Database"}
          </button>
          {editingId ? (
            <button className="table-button" onClick={cancelEditing} type="button">Batal Edit</button>
          ) : null}
        </div>
      </form>

      {dbFoods.length === 0 && !isLoading ? (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <p>Belum ada bahan di database. Tambahkan lewat form di atas atau jalankan <code>npm run db:seed</code>.</p>
        </div>
      ) : (
        <div className="food-db-table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr>
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
              {dbFoods.map((food) => (
                <tr key={food.id}>
                  <td>{food.name}</td>
                  <td>{food.category || "Lainnya"}</td>
                  <td>{formatNumber(food.portion_grams)} g</td>
                  <td>{formatNumber(food.protein)} g</td>
                  <td>{formatNumber(food.calories)} kcal</td>
                  <td>{formatNumber(food.fat)} g</td>
                  <td>{formatNumber(food.carbs)} g</td>
                  <td>Rp {formatNumber(food.price)}</td>
                  <td>
                    <div className="action-cell">
                      <button className="table-button" onClick={() => handleAddSingleToOptimizer(food)} type="button">+ Optimasi</button>
                      <button className="table-button" onClick={() => startEditing(food)} type="button">Edit</button>
                      <button className="table-button" onClick={() => handleDelete(food)} type="button">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default FoodDatabasePanel;
