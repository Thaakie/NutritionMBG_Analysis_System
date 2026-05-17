import "./MenuInputPanel.css";
import { foodCategoryOptions } from "../data/foodCategories";
import { portionScaleOptions } from "../data/portionScales";
import { formatNumber } from "../utils/formatters";

function MenuInputPanel({ foodForm, foods, error, onFoodFormChange, onAddFood, onRemoveFood }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Komposisi Bahan</h2>
        <p>Masukkan komposisi bahan, pilih kategori menu 4 sehat 5 sempurna, atur skala gramasi, lalu lengkapi kandungan nutrisi dan biaya.</p>
      </div>

      <form className="menu-form" onSubmit={onAddFood}>
        <div className="input-grid">
          <label>
            <span>Food name</span>
            <input name="name" placeholder="Example: Telur" value={foodForm.name} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Kategori bahan</span>
            <select name="category" value={foodForm.category} onChange={onFoodFormChange}>
              {foodCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Skala gramasi</span>
            <select name="portionScale" value={foodForm.portionScale} onChange={onFoodFormChange}>
              {portionScaleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Porsi (gram)</span>
            <input
              disabled={foodForm.portionScale !== "custom"}
              min="0"
              name="portionGrams"
              placeholder={foodForm.portionScale === "custom" ? "60" : "Terisi otomatis"}
              type="number"
              value={foodForm.portionGrams}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Protein (g)</span>
            <input min="0" name="protein" placeholder="12" type="number" value={foodForm.protein} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Calories</span>
            <input min="0" name="calories" placeholder="150" type="number" value={foodForm.calories} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Fat (g)</span>
            <input min="0" name="fat" placeholder="6" type="number" value={foodForm.fat} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Carbs (g)</span>
            <input min="0" name="carbs" placeholder="18" type="number" value={foodForm.carbs} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Price (Rp)</span>
            <input min="0" name="price" placeholder="3500" type="number" value={foodForm.price} onChange={onFoodFormChange} />
          </label>
        </div>

        <button className="secondary-button" type="submit">
          Add Food Item
        </button>
      </form>

      <p className="helper-copy">Pilih preset gramasi untuk mengisi porsi otomatis, atau pilih `Custom` jika ingin menulis gramasi sendiri.</p>

      {error ? <p className="feedback error">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Kategori</th>
              <th className="text-right">Porsi</th>
              <th className="text-right">Protein</th>
              <th className="text-right">Kalori</th>
              <th className="text-right">Lemak</th>
              <th className="text-right">Karbo</th>
              <th className="text-right">Harga</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td><strong>{food.name}</strong></td>
                <td><span className="status-pill warning">{food.category || "Lainnya"}</span></td>
                <td className="text-right">
                  {formatNumber(food.portionGrams)} g{food.portionScale && food.portionScale !== "custom" ? ` (${food.portionScale})` : ""}
                </td>
                <td className="text-right">{formatNumber(food.protein)} g</td>
                <td className="text-right">{formatNumber(food.calories)} kcal</td>
                <td className="text-right">{formatNumber(food.fat)} g</td>
                <td className="text-right">{formatNumber(food.carbs)} g</td>
                <td className="text-right">Rp {formatNumber(food.price)}</td>
                <td className="text-center">
                  <button className="table-button remove-btn" onClick={() => onRemoveFood(food.id)} type="button">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MenuInputPanel;
