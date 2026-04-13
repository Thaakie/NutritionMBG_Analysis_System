import "./MenuInputPanel.css";
import { formatNumber } from "../utils/formatters";

function MenuInputPanel({ foodForm, foods, error, onFoodFormChange, onAddFood, onRemoveFood }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Komposisi Bahan</h2>
        <p>Masukkan komposisi bahan, berat porsi, kandungan nutrisi, dan biaya per bahan.</p>
      </div>

      <form className="menu-form" onSubmit={onAddFood}>
        <div className="input-grid">
          <label>
            <span>Food name</span>
            <input name="name" placeholder="Example: Telur" value={foodForm.name} onChange={onFoodFormChange} />
          </label>
          <label>
            <span>Porsi (gram)</span>
            <input
              min="0"
              name="portionGrams"
              placeholder="60"
              type="number"
              value={foodForm.portionGrams}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Protein (g)</span>
            <input
              min="0"
              name="protein"
              placeholder="12"
              type="number"
              value={foodForm.protein}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Calories</span>
            <input
              min="0"
              name="calories"
              placeholder="150"
              type="number"
              value={foodForm.calories}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Fat (g)</span>
            <input
              min="0"
              name="fat"
              placeholder="6"
              type="number"
              value={foodForm.fat}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Carbs (g)</span>
            <input
              min="0"
              name="carbs"
              placeholder="18"
              type="number"
              value={foodForm.carbs}
              onChange={onFoodFormChange}
            />
          </label>
          <label>
            <span>Price (Rp)</span>
            <input
              min="0"
              name="price"
              placeholder="3500"
              type="number"
              value={foodForm.price}
              onChange={onFoodFormChange}
            />
          </label>
        </div>

        <button className="secondary-button" type="submit">
          Add Food Item
        </button>
      </form>

      {error ? <p className="feedback error">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Porsi</th>
              <th>Protein</th>
              <th>Kalori</th>
              <th>Lemak</th>
              <th>Karbo</th>
              <th>Harga</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td>{food.name}</td>
                <td>{formatNumber(food.portionGrams)} g</td>
                <td>{formatNumber(food.protein)} g</td>
                <td>{formatNumber(food.calories)} kcal</td>
                <td>{formatNumber(food.fat)} g</td>
                <td>{formatNumber(food.carbs)} g</td>
                <td>Rp {formatNumber(food.price)}</td>
                <td>
                  <button className="table-button" onClick={() => onRemoveFood(food.id)} type="button">
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
