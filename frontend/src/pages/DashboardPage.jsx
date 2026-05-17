import { useMemo, useState } from "react";
import HeroPanel from "../components/HeroPanel";
import DatasetPanel from "../components/DatasetPanel";
import StepHeader from "../components/StepHeader";
import { sampleDatasets } from "../data/sampleDatasets";
import { formatNumber, formatPercent } from "../utils/formatters";

function DashboardPage({
  constraints,
  currentStatus,
  currentTotals,
  currentAkgPercentages,
  mealTarget,
  foodsCount,
  activeDatasetId,
  onLoadDataset,
  isDatasetLoading,
  result,
  dashboardSummary,
  onApplyQaScenario,
}) {
  const [periodDays, setPeriodDays] = useState(7);
  const [showSpendingDetails, setShowSpendingDetails] = useState(false);

  const periodSummary = useMemo(() => {
    const allItems = dashboardSummary?.historyItems || [];
    const threshold = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const filtered = allItems.filter((item) => {
      const ts = new Date(item.created_at).getTime();
      return Number.isFinite(ts) && ts >= threshold;
    });
    return {
      totalSpent: filtered.reduce((sum, item) => sum + Number(item.total_cost || 0), 0),
      recentMenus: filtered.slice(0, 5),
    };
  }, [dashboardSummary, periodDays]);

  const spendingByDay = useMemo(() => {
    const threshold = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const periodItems = (dashboardSummary?.historyItems || []).filter((item) => {
      const ts = new Date(item.created_at).getTime();
      return Number.isFinite(ts) && ts >= threshold;
    });

    const grouped = new Map();
    periodItems.forEach((item) => {
        const date = new Date(item.created_at);
        const dayKey = date.toLocaleDateString("id-ID");
        if (!grouped.has(dayKey)) {
          grouped.set(dayKey, {
            dayKey,
            totalCost: 0,
            runs: [],
          });
        }
        const bucket = grouped.get(dayKey);
        bucket.totalCost += Number(item.total_cost || 0);
        bucket.runs.push(item);
      });

    return Array.from(grouped.values())
      .sort((a, b) => new Date(b.runs[0]?.created_at || 0) - new Date(a.runs[0]?.created_at || 0));
  }, [dashboardSummary, periodDays]);

  return (
    <>
      <HeroPanel constraints={constraints} currentStatus={currentStatus} />
      <StepHeader
        step={1}
        title="Atur Target Harian"
        description="Tentukan kelompok usia, target AKG, dan budget. Setelah itu lanjut ke input manual bahan menu."
        actionLabel="Lanjut ke Input Manual"
        actionTo="/database"
      />

      <DatasetPanel
        datasets={sampleDatasets}
        activeDatasetId={activeDatasetId}
        onLoadDataset={onLoadDataset}
        isDatasetLoading={isDatasetLoading}
      />

      <div className="panel">
        <div className="panel-heading">
          <h2>Skenario QA Demo</h2>
          <p>Pakai skenario ini untuk uji cepat saat presentasi dosen.</p>
        </div>
        <div className="qa-scenario-actions">
          <button className="secondary-button" type="button" onClick={() => onApplyQaScenario?.("budget-tight")}>
            Budget Ketat
          </button>
          <button className="secondary-button" type="button" onClick={() => onApplyQaScenario?.("protein-high")}>
            Protein Tinggi
          </button>
          <button className="secondary-button" type="button" onClick={() => onApplyQaScenario?.("limited-foods")}>
            Bahan Terbatas
          </button>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <article className="stat-card">
          <span className="stat-label">Bahan Terpilih</span>
          <strong className="stat-value">{foodsCount}</strong>
          <span className="stat-hint">untuk optimasi</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Target Kalori</span>
          <strong className="stat-value">{formatNumber(mealTarget.calories)} kcal</strong>
          <span className="stat-hint">per porsi MBG</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Target Protein</span>
          <strong className="stat-value">{formatNumber(mealTarget.protein)} g</strong>
          <span className="stat-hint">per porsi MBG</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Status</span>
          <strong className={`stat-value ${currentStatus === "Layak" ? "text-success" : currentStatus === "Perlu optimasi" ? "text-warning" : "text-danger"}`}>
            {currentStatus}
          </strong>
          <span className="stat-hint">kelayakan preview</span>
        </article>
        <article className="stat-card highlight-calories">
          <span className="stat-label">Optimasi Hari Ini</span>
          <strong className="stat-value">{formatNumber(dashboardSummary?.optimizedTodayCount || 0)}x</strong>
          <span className="stat-hint">
            {dashboardSummary?.optimizedTodayCount > 0 ? "Sudah optimasi hari ini" : "Belum optimasi hari ini"}
          </span>
        </article>
        <article className="stat-card highlight-cost">
          <span className="stat-label">Total Pengeluaran ({periodDays} hari)</span>
          <strong className="stat-value">Rp {formatNumber(periodSummary.totalSpent || 0)}</strong>
          <span className="stat-hint">berdasarkan periode terpilih</span>
          <button
            className="see-more-button"
            type="button"
            onClick={() => setShowSpendingDetails((current) => !current)}
          >
            {showSpendingDetails ? "Hide details" : "See more"}
          </button>
        </article>
      </div>

      {showSpendingDetails ? (
        <div className="panel">
          <div className="panel-heading">
            <h2>Rincian Pengeluaran Harian</h2>
            <p>Grouped per hari + jumlah input pada hari yang sama.</p>
          </div>
          {spendingByDay.length === 0 ? (
            <p className="comparison-note">Belum ada data pengeluaran pada periode ini.</p>
          ) : (
            <div className="history-list">
              {spendingByDay.map((group) => (
                <article className="ranking-card" key={group.dayKey}>
                  <div className="ranking-header">
                    <h3>{group.dayKey}</h3>
                    <span>Rp {formatNumber(group.totalCost)}</span>
                  </div>
                  <p>{group.runs.length}x input/optimasi di hari ini</p>
                  <details className="history-audit">
                    <summary>Lihat run per input</summary>
                    {group.runs.map((run) => (
                      <p key={run.id}>
                        {new Date(run.created_at).toLocaleTimeString("id-ID")} - Rp {formatNumber(run.total_cost || 0)}
                      </p>
                    ))}
                  </details>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {foodsCount > 0 && (
        <div className="panel">
          <div className="panel-heading">
            <h2>Preview Nutrisi Kandidat</h2>
            <p>Total nutrisi dari {foodsCount} bahan yang dicentang di Database Bahan.</p>
          </div>
          <div className="totals-grid metrics-wide">
            <article className="metric-card">
              <span>Kalori</span>
              <strong>{formatNumber(currentTotals.totalCalories)} kcal</strong>
            </article>
            <article className="metric-card">
              <span>Protein</span>
              <strong>{formatNumber(currentTotals.totalProtein)} g</strong>
            </article>
            <article className="metric-card">
              <span>Lemak</span>
              <strong>{formatNumber(currentTotals.totalFat)} g</strong>
            </article>
            <article className="metric-card">
              <span>Karbohidrat</span>
              <strong>{formatNumber(currentTotals.totalCarbs)} g</strong>
            </article>
            <article className="metric-card">
              <span>Total Biaya</span>
              <strong>Rp {formatNumber(currentTotals.totalCost)}</strong>
            </article>
          </div>
          <div className="totals-grid metrics-wide" style={{ marginTop: 10 }}>
            <article className="metric-card">
              <span>AKG Kalori</span>
              <strong>{formatPercent(currentAkgPercentages.calories)}</strong>
            </article>
            <article className="metric-card">
              <span>AKG Protein</span>
              <strong>{formatPercent(currentAkgPercentages.protein)}</strong>
            </article>
            <article className="metric-card">
              <span>AKG Lemak</span>
              <strong>{formatPercent(currentAkgPercentages.fat)}</strong>
            </article>
            <article className="metric-card">
              <span>AKG Karbo</span>
              <strong>{formatPercent(currentAkgPercentages.carbs)}</strong>
            </article>
          </div>
        </div>
      )}

      {result?.recommended_menu?.length > 0 && (
        <div className="panel">
          <div className="panel-heading">
            <h2>Hasil Optimasi Terakhir</h2>
            <p>Menu: {result.recommended_menu.join(", ")}</p>
          </div>
          <p className={`feedback ${result.feasibility_status === "Layak" ? "success-feedback" : "error"}`}>
            Status: {result.feasibility_status} — Biaya: Rp {formatNumber(result.total_cost)}
          </p>
        </div>
      )}

      <div className="panel">
        <div className="panel-heading">
          <h2>Riwayat Menu ({periodDays} hari)</h2>
          <p>Riwayat 5 optimasi terakhir berdasarkan periode.</p>
        </div>
        <div className="period-toggle">
          <button
            className={`secondary-button ${periodDays === 7 ? "period-active" : ""}`}
            type="button"
            onClick={() => setPeriodDays(7)}
          >
            7 hari
          </button>
          <button
            className={`secondary-button ${periodDays === 30 ? "period-active" : ""}`}
            type="button"
            onClick={() => setPeriodDays(30)}
          >
            30 hari
          </button>
        </div>
        {!periodSummary.recentMenus.length ? (
          <p className="comparison-note">Belum ada riwayat optimasi yang tersimpan.</p>
        ) : (
          <div className="history-list">
            {periodSummary.recentMenus.map((entry) => (
              <article className="ranking-card" key={entry.id}>
                <div className="ranking-header">
                  <h3>{(entry.recommended_menu || []).join(", ") || "-"}</h3>
                  <span>{entry.age_group}</span>
                </div>
                <p>{new Date(entry.created_at).toLocaleString("id-ID")}</p>
                <p>Biaya: Rp {formatNumber(entry.total_cost || 0)}</p>
                <details className="history-audit">
                  <summary>Lihat input saat itu</summary>
                  <p>Budget: Rp {formatNumber(entry.request_payload?.budget || 0)}</p>
                  <p>Usia: {entry.request_payload?.age_group || "-"}</p>
                  <p>Siswa: {formatNumber(entry.request_payload?.student_count || 1)}</p>
                  <p>Target kalori min: {formatNumber(entry.request_payload?.minimum_calories || 0)} kcal</p>
                  <p>Target protein min: {formatNumber(entry.request_payload?.minimum_protein || 0)} g</p>
                  <p>Jumlah bahan input: {formatNumber(entry.request_payload?.foods?.length || 0)}</p>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardPage;
