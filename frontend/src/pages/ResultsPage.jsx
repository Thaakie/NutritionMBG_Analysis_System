import ResultsPanel from "../components/ResultsPanel";
import SummaryPanel from "../components/SummaryPanel";
import StepHeader from "../components/StepHeader";

function ResultsPage({ result, recommendedFoods, menuHistory, onClearHistory, currentAkgPercentages, currentStatus, currentTotals, mealTarget, payloadPreview, recommendedBatch, recommendedBatchTotals, studentCount }) {
  return (
    <>
      <StepHeader
        step={4}
        title="Analisis Hasil"
        description="Bandingkan biaya, AKG, dan menu rekomendasi. Jika belum layak, kembali ke input manual untuk revisi."
        actionLabel="Kembali ke Input Manual"
        actionTo="/database"
        variant={result ? "default" : "warning"}
      />
      <div className="results-layout">
        <ResultsPanel
          historyEntries={menuHistory}
          onClearHistory={onClearHistory}
          recommendedFoods={recommendedFoods}
          result={result}
        />
        <SummaryPanel
          currentAkgPercentages={currentAkgPercentages}
          currentStatus={currentStatus}
          currentTotals={currentTotals}
          mealTarget={mealTarget}
          payloadPreview={payloadPreview}
          recommendedBatch={recommendedBatch}
          recommendedBatchTotals={recommendedBatchTotals}
          studentCount={studentCount}
          result={result}
        />
      </div>
    </>
  );
}

export default ResultsPage;
