import "./ControlsPanel.css";
import { akgProfiles } from "../data/akgProfiles";
import { formatNumber, formatPercent } from "../utils/formatters";

function ControlsPanel({ constraints, currentTotals, currentAkgPercentages, currentStatus, isSubmitting, foodsCount, foods, mealTarget, onConstraintChange, onOptimize }) {
  const budgetValue = Number(constraints.budget || 0);
  const budgetRatio = budgetValue > 0 ? currentTotals.totalCost / budgetValue : 0;
  const calorieRatio = mealTarget.calories > 0 ? currentTotals.totalCalories / mealTarget.calories : 0;
  const proteinRatio = mealTarget.protein > 0 ? currentTotals.totalProtein / mealTarget.protein : 0;

  function statusToneByRatio(ratio, { minOk = 1, near = 0.9 } = {}) {
    if (ratio >= minOk) return "success";
    if (ratio >= near) return "warning";
    return "danger";
  }

  const budgetTone = budgetRatio <= 0.9 ? "success" : budgetRatio <= 1 ? "warning" : "danger";
  const caloriesTone = statusToneByRatio(calorieRatio, { minOk: 1, near: 0.85 });
  const proteinTone = statusToneByRatio(proteinRatio, { minOk: 1, near: 0.85 });

  const categorySet = new Set((foods || []).map((item) => item.category || "Lainnya"));
  const hasMain = categorySet.has("Makanan Pokok");
  const hasLauk = categorySet.has("Lauk Pauk") || categorySet.has("Lauk Hewani") || categorySet.has("Lauk Nabati");
  const hasVeg = categorySet.has("Sayuran");
  const hasFruit = categorySet.has("Buah-buahan");

  const missingCoreCategories = [];
  if (!hasMain) missingCoreCategories.push("Makanan Pokok");
  if (!hasLauk) missingCoreCategories.push("Lauk");
  if (!hasVeg) missingCoreCategories.push("Sayuran");

  const akgRows = Object.entries(akgProfiles).map(([ageKey, profile]) => {
    const daily = profile.dailyTarget;
    return {
      ageKey,
      label: profile.label,
      dailyCalories: daily.calories,
      dailyProtein: daily.protein,
      mbgCalories: Number((daily.calories * 0.3).toFixed(1)),
      mbgProtein: Number((daily.protein * 0.3).toFixed(1)),
    };
  });

  return (
    <div className="panel controls-panel">
      <div className="panel-heading">
        <h2>Kontrol Optimasi</h2>
        <p>Atur kelompok usia dan batas biaya per porsi. Target minimum AI dihitung otomatis dari referensi AKG.</p>
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
          <span>Jumlah Penerima</span>
          <input min="1" name="studentCount" type="number" value={constraints.studentCount} onChange={onConstraintChange} />
        </label>
      </div>

      <div className="reference-note">
        <p>
          Target referensi per porsi MBG: {formatNumber(mealTarget.calories)} kcal, {formatNumber(mealTarget.protein)} g protein, {formatNumber(mealTarget.fat)} g lemak, {formatNumber(mealTarget.carbs)} g karbohidrat.
        </p>
        <p>Minimum kalori dan protein untuk engine diisi otomatis berdasarkan kelompok usia yang dipilih.</p>
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
        <span className={`status-pill ${budgetTone}`}>{budgetRatio > 1 ? "Over budget" : budgetRatio > 0.9 ? "Biaya mepet budget" : "Biaya aman"}</span>
        <span className={`status-pill ${caloriesTone}`}>{calorieRatio >= 1 ? "Kalori capai target AI" : calorieRatio >= 0.85 ? "Kalori hampir capai target" : "Kalori masih jauh dari target"}</span>
        <span className={`status-pill ${proteinTone}`}>{proteinRatio >= 1 ? "Protein capai target AI" : proteinRatio >= 0.85 ? "Protein hampir capai target" : "Protein masih jauh dari target"}</span>
      </div>

      {missingCoreCategories.length > 0 ? <div className="feedback error">Komposisi kandidat belum lengkap untuk optimasi stabil. Tambahkan: {missingCoreCategories.join(", ")}.</div> : null}

      {missingCoreCategories.length === 0 && !hasFruit ? <div className="reference-note">Belum ada buah pada kandidat. Ini tidak selalu wajib, tapi disarankan agar menu lebih seimbang.</div> : null}

      <details className="reference-note akg-minimum-note">
        <summary>AKG minimal per kelompok umur (ringkas)</summary>
        <div className="akg-mini-table-wrap">
          <table className="akg-mini-table">
            <thead>
              <tr>
                <th>Usia</th>
                <th>Kalori harian</th>
                <th>Protein harian</th>
                <th>Kalori min MBG (30%)</th>
                <th>Protein min MBG (30%)</th>
              </tr>
            </thead>
            <tbody>
              {akgRows.map((row) => (
                <tr key={row.ageKey} className={constraints.ageGroup === row.ageKey ? "active" : ""}>
                  <td>{row.label}</td>
                  <td>{formatNumber(row.dailyCalories)} kcal</td>
                  <td>{formatNumber(row.dailyProtein)} g</td>
                  <td>{formatNumber(row.mbgCalories)} kcal</td>
                  <td>{formatNumber(row.mbgProtein)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <button className="primary-button" disabled={isSubmitting || foodsCount === 0} onClick={onOptimize}>
        {isSubmitting ? "Sedang optimasi..." : "Jalankan Optimasi AI"}
      </button>
    </div>
  );
}

export default ControlsPanel;
