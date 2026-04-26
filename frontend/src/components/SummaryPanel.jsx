import "./SummaryPanel.css";
import { formatNumber, formatPercent } from "../utils/formatters";

function SummaryPanel({ result, payloadPreview, mealTarget }) {
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

      <div className="summary-preview">
        <h3>API payload preview</h3>
        <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
      </div>
    </div>
  );
}

export default SummaryPanel;
