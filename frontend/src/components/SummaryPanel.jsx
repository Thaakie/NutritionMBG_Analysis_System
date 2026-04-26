import "./SummaryPanel.css";
import { formatNumber, formatPercent, formatSignedNumber } from "../utils/formatters";

function SummaryPanel({
  result,
  payloadPreview,
  mealTarget,
  currentTotals,
  currentAkgPercentages,
  currentStatus,
}) {
  const optimizedTotals = {
    calories: result?.total_calories || 0,
    protein: result?.total_protein || 0,
    fat: result?.total_fat || 0,
    carbs: result?.total_carbs || 0,
    cost: result?.total_cost || 0,
  };

  const optimizedAkg = result?.akg_percentages || {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  const comparisonRows = [
    {
      label: "Kalori",
      manual: currentTotals.totalCalories,
      optimized: optimizedTotals.calories,
      suffix: "kcal",
    },
    {
      label: "Protein",
      manual: currentTotals.totalProtein,
      optimized: optimizedTotals.protein,
      suffix: "g",
    },
    {
      label: "Lemak",
      manual: currentTotals.totalFat,
      optimized: optimizedTotals.fat,
      suffix: "g",
    },
    {
      label: "Karbohidrat",
      manual: currentTotals.totalCarbs,
      optimized: optimizedTotals.carbs,
      suffix: "g",
    },
    {
      label: "Biaya",
      manual: currentTotals.totalCost,
      optimized: optimizedTotals.cost,
      prefix: "Rp ",
    },
    {
      label: "AKG Kalori",
      manual: currentAkgPercentages.calories,
      optimized: optimizedAkg.calories,
      suffix: "%",
    },
    {
      label: "AKG Protein",
      manual: currentAkgPercentages.protein,
      optimized: optimizedAkg.protein,
      suffix: "%",
    },
    {
      label: "AKG Lemak",
      manual: currentAkgPercentages.fat,
      optimized: optimizedAkg.fat,
      suffix: "%",
    },
    {
      label: "AKG Karbo",
      manual: currentAkgPercentages.carbs,
      optimized: optimizedAkg.carbs,
      suffix: "%",
    },
  ];

  function renderValue(value, { prefix = "", suffix = "" } = {}) {
    return `${prefix}${formatNumber(value)}${suffix}`;
  }

  function renderDeltaValue(value, { prefix = "", suffix = "" } = {}) {
    return `${prefix}${formatSignedNumber(value)}${suffix}`;
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Dashboard Output</h2>
        <p>Tampilkan hasil optimasi final, pemenuhan AKG, dan payload yang dikirim ke engine.</p>
      </div>

      <div className="totals-grid metrics-wide">
        <article className="metric-card">
          <span>Recommended calories</span>
          <strong>{formatNumber(result?.total_calories || 0)} kcal</strong>
        </article>
        <article className="metric-card">
          <span>Recommended protein</span>
          <strong>{formatNumber(result?.total_protein || 0)} g</strong>
        </article>
        <article className="metric-card">
          <span>Recommended fat</span>
          <strong>{formatNumber(result?.total_fat || 0)} g</strong>
        </article>
        <article className="metric-card">
          <span>Recommended carbs</span>
          <strong>{formatNumber(result?.total_carbs || 0)} g</strong>
        </article>
        <article className="metric-card">
          <span>Recommended cost</span>
          <strong>Rp {formatNumber(result?.total_cost || 0)}</strong>
        </article>
      </div>

      {result?.akg_percentages ? (
        <div className="totals-grid metrics-wide">
          <article className="metric-card">
            <span>AKG calories</span>
            <strong>{formatPercent(result.akg_percentages.calories)}</strong>
          </article>
          <article className="metric-card">
            <span>AKG protein</span>
            <strong>{formatPercent(result.akg_percentages.protein)}</strong>
          </article>
          <article className="metric-card">
            <span>AKG fat</span>
            <strong>{formatPercent(result.akg_percentages.fat)}</strong>
          </article>
          <article className="metric-card">
            <span>AKG carbs</span>
            <strong>{formatPercent(result.akg_percentages.carbs)}</strong>
          </article>
          <article className="metric-card">
            <span>Status kelayakan</span>
            <strong>{result.feasibility_status || "-"}</strong>
          </article>
        </div>
      ) : null}

      {result?.nutrition_reference ? (
        <div className="reference-note">
          <p>
            Referensi: {result.nutrition_reference.label} | Target porsi MBG {formatNumber(
              result.nutrition_reference.meal_target.calories,
            )}{" "}
            kcal, {formatNumber(result.nutrition_reference.meal_target.protein)} g protein.
          </p>
        </div>
      ) : null}

      {!result ? (
        <div className="reference-note">
          <p>
            Belum ada hasil optimasi. Saat tombol dijalankan, panel ini akan
            menampilkan hasil menu final berdasarkan target otomatis{" "}
            {formatNumber(mealTarget.calories)} kcal dan{" "}
            {formatNumber(mealTarget.protein)} g protein.
          </p>
        </div>
      ) : null}

      <div className="summary-preview comparison-section">
        <h3>Perbandingan manual vs hasil optimasi</h3>
        <div className="table-wrap comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Manual / preview</th>
                <th>Hasil optimasi</th>
                <th>Selisih optimasi</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{renderValue(row.manual, row)}</td>
                  <td>{renderValue(row.optimized, row)}</td>
                  <td>{renderDeltaValue(row.optimized - row.manual, row)}</td>
                </tr>
              ))}
              <tr>
                <td>Status kelayakan</td>
                <td>{currentStatus}</td>
                <td>{result?.feasibility_status || "Belum ada hasil"}</td>
                <td>{result ? "Bandingkan dengan tabel di atas" : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="comparison-note">
          Selisih optimasi dihitung sebagai hasil optimasi dikurangi perhitungan
          manual kandidat bahan.
        </p>
      </div>

      <div className="summary-preview">
        <h3>API payload preview</h3>
        <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
      </div>
    </div>
  );
}

export default SummaryPanel;
