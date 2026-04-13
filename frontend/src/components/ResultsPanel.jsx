import "./ResultsPanel.css";
import { formatNumber, formatPercent } from "../utils/formatters";

function ResultsPanel({ result, recommendedFoods }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Rekomendasi Menu</h2>
        <p>Engine menampilkan menu terbaik, persentase AKG, dan ranking alternatif menu.</p>
      </div>

      {!result ? (
        <div className="empty-state">
          <p>No optimization has been run yet.</p>
        </div>
      ) : (
        <>
          <div className="status-row">
            <span className={result.status === "optimal" ? "status-pill success" : "status-pill warning"}>
              Solver: {result.status}
            </span>
            <span
              className={
                result.feasibility_status === "Layak" ? "status-pill success" : "status-pill warning"
              }
            >
              Status: {result.feasibility_status}
            </span>
          </div>

          {result.message ? <p className="feedback warning">{result.message}</p> : null}

          <div className="recommendation-list">
            {recommendedFoods.length === 0 ? (
              <div className="empty-state">
                <p>No foods selected by the optimizer.</p>
              </div>
            ) : (
              recommendedFoods.map((food) => (
                <article className="food-card" key={food.id}>
                  <h3>{food.name}</h3>
                  <p>{formatNumber(food.portionGrams)} g per porsi</p>
                  <p>{formatNumber(food.protein)} g protein</p>
                  <p>{formatNumber(food.calories)} kcal</p>
                  <p>{formatNumber(food.fat)} g lemak</p>
                  <p>{formatNumber(food.carbs)} g karbohidrat</p>
                  <p>Rp {formatNumber(food.price)}</p>
                </article>
              ))
            )}
          </div>

          {result.ranked_alternatives?.length ? (
            <div className="ranking-list">
              {result.ranked_alternatives.map((alternative) => (
                <article className="ranking-card" key={alternative.rank}>
                  <div className="ranking-header">
                    <h3>Peringkat {alternative.rank}</h3>
                    <span>{alternative.feasibility_status}</span>
                  </div>
                  <p>{alternative.recommended_menu.join(", ")}</p>
                  <p>
                    Skor {formatNumber(alternative.nutrition_score)} | Rp {formatNumber(alternative.total_cost)}
                  </p>
                  <p>
                    AKG: {formatPercent(alternative.akg_percentages.calories)} kalori,{" "}
                    {formatPercent(alternative.akg_percentages.protein)} protein
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ResultsPanel;
