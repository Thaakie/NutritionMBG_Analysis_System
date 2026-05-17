import FoodDatabasePanel from "../components/FoodDatabasePanel";
import StepHeader from "../components/StepHeader";

function DatabasePage({ datasetFoodNames, onDatasetApplied, onSelectionChange, selectedFoodIds, onNotify }) {
  return (
    <>
      <StepHeader
        step={2}
        title="Input Bahan Manual"
        description="Tambahkan bahan menu MBG hari ini, lalu centang kandidat yang akan dihitung AI."
        actionLabel="Lanjut ke Optimasi"
        actionTo="/optimize"
      />
      <FoodDatabasePanel
        datasetFoodNames={datasetFoodNames}
        onDatasetApplied={onDatasetApplied}
        onSelectionChange={onSelectionChange}
        selectedFoodIds={selectedFoodIds}
        onNotify={onNotify}
      />
    </>
  );
}

export default DatabasePage;
