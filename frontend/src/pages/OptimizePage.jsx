import ControlsPanel from "../components/ControlsPanel";
import StepHeader from "../components/StepHeader";
import { formatNumber } from "../utils/formatters";
import { Link } from "react-router-dom";

function OptimizePage({ constraints, currentTotals, currentAkgPercentages, currentStatus, mealTarget, foods, isSubmitting, error, onConstraintChange, onOptimize, onRemoveFood }) {
  return (
    <>
      <StepHeader
        step={3}
        title="Jalankan Optimasi AI"
        description="Pastikan kandidat bahan, biaya, dan target AKG sudah sesuai sebelum proses optimasi."
        actionLabel="Lihat Hasil Analisis"
        actionTo="/results"
      />
      <ControlsPanel
        constraints={constraints}
        currentAkgPercentages={currentAkgPercentages}
        currentStatus={currentStatus}
        currentTotals={currentTotals}
        foods={foods}
        foodsCount={foods.length}
        isSubmitting={isSubmitting}
        mealTarget={mealTarget}
        onConstraintChange={onConstraintChange}
        onOptimize={onOptimize}
      />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-heading">
          <h2>Preview Kandidat</h2>
          <p>{foods.length} bahan terpilih dari database untuk dioptimasi.</p>
        </div>
        {foods.length === 0 ? (
          <div className="empty-state empty-state-action">
            <p>Belum ada kandidat bahan. Isi dan centang bahan dulu di halaman Input Manual.</p>
            <Link className="secondary-button" to="/database">Pergi ke Input Manual</Link>
          </div>
        ) : (
          <div className="table-wrap optimize-table-wrap" style={{ maxHeight: 400, overflowY: "auto" }}>
            <table className="optimize-table">
              <thead>
                <tr>
                  <th>Bahan</th>
                  <th>Kategori</th>
                  <th className="text-right">Porsi</th>
                  <th className="text-right">Protein</th>
                  <th className="text-right">Kalori</th>
                  <th className="text-right">Lemak</th>
                  <th className="text-right">Karbo</th>
                  <th className="text-right">Harga</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id}>
                    <td><strong>{food.name}</strong></td>
                    <td><span className="status-pill warning">{food.category}</span></td>
                    <td className="text-right">{formatNumber(food.portionGrams)} g</td>
                    <td className="text-right">{formatNumber(food.protein)} g</td>
                    <td className="text-right">{formatNumber(food.calories)} kcal</td>
                    <td className="text-right">{formatNumber(food.fat)} g</td>
                    <td className="text-right">{formatNumber(food.carbs)} g</td>
                    <td className="text-right">Rp {formatNumber(food.price)}</td>
                    <td className="text-center">
                      <button
                        className="table-button remove-btn"
                        onClick={() => onRemoveFood(food.id)}
                        type="button"
                        title="Hapus dari kandidat"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error ? <p className="feedback error">{error}</p> : null}
      </div>
    </>
  );
}

export default OptimizePage;
