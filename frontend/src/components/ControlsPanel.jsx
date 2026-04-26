import "./ControlsPanel.css";
import { akgProfiles } from "../data/akgProfiles";
import { formatNumber, formatPercent } from "../utils/formatters";

function ControlsPanel({
  constraints,
  currentTotals,
  currentAkgPercentages,
  currentStatus,
  isSubmitting,
  foodsCount,
  mealTarget,
  onConstraintChange,
  onOptimize,
}) {
  return (
    <div className="panel controls-panel">
      <div className="panel-heading">
        <h2>Optimization Controls</h2>
        <p>
          Atur kelompok usia siswa dan batas biaya per porsi. Target minimum AI
          akan dihitung otomatis dari referensi AKG.
        </p>
      </div>

      <div className="input-grid">
        <label>
          <span>Kelompok usia</span>
          <select
            name="ageGroup"
            value={constraints.ageGroup}
            onChange={onConstraintChange}
          >
            {Object.entries(akgProfiles).map(([value, profile]) => (
              <option key={value} value={value}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Budget (Rp)</span>
          <input
            min="0"
            name="budget"
            type="number"
            value={constraints.budget}
            onChange={onConstraintChange}
          />
        </label>
        <label>
          <span>Jumlah siswa</span>
          <input
            min="1"
            name="studentCount"
            type="number"
            value={constraints.studentCount}
            onChange={onConstraintChange}
          />
        </label>
      </div>

      <div className="reference-note">
        <p>
          Target referensi per porsi MBG: {formatNumber(mealTarget.calories)}{" "}
          kcal, {formatNumber(mealTarget.protein)} g protein,{" "}
          {formatNumber(mealTarget.fat)} g lemak,{" "}
          {formatNumber(mealTarget.carbs)} g karbohidrat.
        </p>
        <p>
          Minimum kalori dan protein untuk engine diisi otomatis berdasarkan
          kelompok usia yang dipilih.
        </p>
      </div>

      <div className="totals-grid metrics-wide">
        <article className="metric-card">
          <span>Preview kandidat kalori</span>
          <strong>{formatNumber(currentTotals.totalCalories)} kcal</strong>
        </article>
        <article className="metric-card">
          <span>Preview kandidat protein</span>
          <strong>{formatNumber(currentTotals.totalProtein)} g</strong>
        </article>
        <article className="metric-card">
          <span>Preview kandidat lemak</span>
          <strong>{formatNumber(currentTotals.totalFat)} g</strong>
        </article>
        <article className="metric-card">
          <span>Preview kandidat karbo</span>
          <strong>{formatNumber(currentTotals.totalCarbs)} g</strong>
        </article>
        <article className="metric-card">
          <span>Preview kandidat biaya</span>
          <strong>Rp {formatNumber(currentTotals.totalCost)}</strong>
        </article>
      </div>

      <div className="totals-grid metrics-wide">
        <article className="metric-card">
          <span>AKG calories</span>
          <strong>{formatPercent(currentAkgPercentages.calories)}</strong>
        </article>
        <article className="metric-card">
          <span>AKG protein</span>
          <strong>{formatPercent(currentAkgPercentages.protein)}</strong>
        </article>
        <article className="metric-card">
          <span>AKG fat</span>
          <strong>{formatPercent(currentAkgPercentages.fat)}</strong>
        </article>
        <article className="metric-card">
          <span>AKG carbs</span>
          <strong>{formatPercent(currentAkgPercentages.carbs)}</strong>
        </article>
        <article className="metric-card">
          <span>Status kelayakan</span>
          <strong>{currentStatus}</strong>
        </article>
      </div>

      <div className="status-row">
        <span
          className={
            currentTotals.totalCost <= constraints.budget
              ? "status-pill success"
              : "status-pill warning"
          }
        >
          {currentTotals.totalCost <= constraints.budget
            ? "Within budget"
            : "Over budget"}
        </span>
        <span
          className={
            currentTotals.totalCalories >= mealTarget.calories
              ? "status-pill success"
              : "status-pill warning"
          }
        >
          {currentTotals.totalCalories >= mealTarget.calories
            ? "Preview kalori capai target AI"
            : "Preview kalori belum capai target AI"}
        </span>
        <span
          className={
            currentTotals.totalProtein >= mealTarget.protein
              ? "status-pill success"
              : "status-pill warning"
          }
        >
          {currentTotals.totalProtein >= mealTarget.protein
            ? "Preview protein capai target AI"
            : "Preview protein belum capai target AI"}
        </span>
      </div>

      <button
        className="primary-button"
        disabled={isSubmitting || foodsCount === 0}
        onClick={onOptimize}
      >
        {isSubmitting ? "Optimizing menu..." : "Run AI Optimization"}
      </button>
    </div>
  );
}

export default ControlsPanel;
