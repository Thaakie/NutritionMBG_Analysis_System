import "./ControlsPanel.css";
import { akgProfiles, getMealTarget } from "../data/akgProfiles";
import { formatNumber, formatPercent } from "../utils/formatters";

function ControlsPanel({
  constraints,
  currentTotals,
  currentAkgPercentages,
  currentStatus,
  isSubmitting,
  foodsCount,
  onConstraintChange,
  onOptimize,
}) {
  const mealTarget = getMealTarget(constraints.ageGroup);

  return (
    <div className="panel controls-panel">
      <div className="panel-heading">
        <h2>Optimization Controls</h2>
        <p>Atur target menu, kelompok usia siswa, dan batas biaya per porsi sebelum optimasi.</p>
      </div>

      <div className="input-grid">
        <label>
          <span>Kelompok usia</span>
          <select name="ageGroup" value={constraints.ageGroup} onChange={onConstraintChange}>
            {Object.entries(akgProfiles).map(([value, profile]) => (
              <option key={value} value={value}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Budget (Rp)</span>
          <input min="0" name="budget" type="number" value={constraints.budget} onChange={onConstraintChange} />
        </label>
        <label>
          <span>Minimum calories</span>
          <input
            min="0"
            name="minimumCalories"
            type="number"
            value={constraints.minimumCalories}
            onChange={onConstraintChange}
          />
        </label>
        <label>
          <span>Minimum protein</span>
          <input
            min="0"
            name="minimumProtein"
            type="number"
            value={constraints.minimumProtein}
            onChange={onConstraintChange}
          />
        </label>
      </div>

      <div className="reference-note">
        <p>
          Target referensi per porsi MBG: {formatNumber(mealTarget.calories)} kcal, {formatNumber(mealTarget.protein)} g
          protein, {formatNumber(mealTarget.fat)} g lemak, {formatNumber(mealTarget.carbs)} g karbohidrat.
        </p>
      </div>

      <div className="totals-grid metrics-wide">
        <article className="metric-card">
          <span>Current calories</span>
          <strong>{formatNumber(currentTotals.totalCalories)} kcal</strong>
        </article>
        <article className="metric-card">
          <span>Current protein</span>
          <strong>{formatNumber(currentTotals.totalProtein)} g</strong>
        </article>
        <article className="metric-card">
          <span>Current fat</span>
          <strong>{formatNumber(currentTotals.totalFat)} g</strong>
        </article>
        <article className="metric-card">
          <span>Current carbs</span>
          <strong>{formatNumber(currentTotals.totalCarbs)} g</strong>
        </article>
        <article className="metric-card">
          <span>Current cost</span>
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
        <span className={currentTotals.totalCost <= constraints.budget ? "status-pill success" : "status-pill warning"}>
          {currentTotals.totalCost <= constraints.budget ? "Within budget" : "Over budget"}
        </span>
        <span
          className={
            currentTotals.totalCalories >= constraints.minimumCalories
              ? "status-pill success"
              : "status-pill warning"
          }
        >
          {currentTotals.totalCalories >= constraints.minimumCalories
            ? "Calories target met"
            : "Calories target not met"}
        </span>
        <span
          className={
            currentTotals.totalProtein >= constraints.minimumProtein ? "status-pill success" : "status-pill warning"
          }
        >
          {currentTotals.totalProtein >= constraints.minimumProtein
            ? "Protein target met"
            : "Protein target not met"}
        </span>
      </div>

      <button className="primary-button" disabled={isSubmitting || foodsCount === 0} onClick={onOptimize}>
        {isSubmitting ? "Optimizing menu..." : "Run AI Optimization"}
      </button>
    </div>
  );
}

export default ControlsPanel;
