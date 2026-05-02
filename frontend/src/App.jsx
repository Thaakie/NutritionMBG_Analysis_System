import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/ui.css";
import "./App.css";
import ControlsPanel from "./components/ControlsPanel";
import DatasetPanel from "./components/DatasetPanel";
import FoodDatabasePanel from "./components/FoodDatabasePanel";
import HeroPanel from "./components/HeroPanel";
import ResultsPanel from "./components/ResultsPanel";
import SummaryPanel from "./components/SummaryPanel";
import { getMealTarget } from "./data/akgProfiles";
import { sampleDatasets } from "./data/sampleDatasets";
import {
  calculateAkgPercentages,
  calculateBatchTotals,
  calculateTotals,
  classifyFeasibility,
  scaleFoodsForStudents,
} from "./utils/nutrition";

const defaultDataset = sampleDatasets[0];
const MENU_HISTORY_STORAGE_KEY = "nutrisafety-menu-history";
const MAX_MENU_HISTORY = 5;

function normalizeMenuKey(menu) {
  return [...menu].sort().join("|");
}

function readMenuHistory() {
  if (typeof window === "undefined") return [];
  try {
    const storedValue = window.localStorage.getItem(MENU_HISTORY_STORAGE_KEY);
    if (!storedValue) return [];
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function parseNum(val) {
  if (val === "" || val === undefined || val === null) return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function App() {
  // Foods = selected foods from DB panel checkboxes (set by FoodDatabasePanel)
  const [foods, setFoods] = useState([]);
  const [constraints, setConstraints] = useState({
    ageGroup: defaultDataset.constraints.ageGroup,
    budget: String(defaultDataset.constraints.budget),
    studentCount: String(defaultDataset.constraints.studentCount),
  });
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [datasetToLoad, setDatasetToLoad] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuHistory, setMenuHistory] = useState(readMenuHistory);

  // Parse constraint numbers safely
  const budget = parseNum(constraints.budget);
  const studentCount = Math.max(1, parseNum(constraints.studentCount) || 1);

  const currentTotals = useMemo(() => calculateTotals(foods), [foods]);
  const mealTarget = useMemo(() => getMealTarget(constraints.ageGroup), [constraints.ageGroup]);
  const currentAkgPercentages = useMemo(
    () => calculateAkgPercentages(currentTotals, constraints.ageGroup),
    [constraints.ageGroup, currentTotals],
  );
  const currentStatus = useMemo(
    () => classifyFeasibility(currentTotals, currentAkgPercentages, budget),
    [budget, currentAkgPercentages, currentTotals],
  );

  const payloadPreview = useMemo(
    () => ({
      budget: budget,
      age_group: constraints.ageGroup,
      excluded_menus: menuHistory.map((entry) => entry.recommendedMenu),
      student_count: studentCount,
      minimum_calories: mealTarget.calories,
      minimum_protein: mealTarget.protein,
      foods: foods.map(({ name, category, portionGrams, protein, calories, fat, carbs, price }) => ({
        name,
        category: category || "Lainnya",
        portion_grams: portionGrams,
        protein,
        calories,
        fat,
        carbs,
        price,
      })),
    }),
    [constraints.ageGroup, budget, studentCount, foods, mealTarget.calories, mealTarget.protein, menuHistory],
  );

  const recommendedFoods = useMemo(() => {
    if (!result?.recommended_menu) return [];
    return foods.filter((food) => result.recommended_menu.includes(food.name));
  }, [foods, result]);

  const recommendedBatch = useMemo(
    () => scaleFoodsForStudents(recommendedFoods, studentCount),
    [studentCount, recommendedFoods],
  );

  const recommendedBatchTotals = useMemo(
    () =>
      calculateBatchTotals(
        {
          totalCalories: result?.total_calories || 0,
          totalProtein: result?.total_protein || 0,
          totalFat: result?.total_fat || 0,
          totalCarbs: result?.total_carbs || 0,
          totalCost: result?.total_cost || 0,
        },
        studentCount,
      ),
    [studentCount, result],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MENU_HISTORY_STORAGE_KEY, JSON.stringify(menuHistory));
  }, [menuHistory]);

  function handleConstraintChange(event) {
    const { name, value } = event.target;

    if (name === "ageGroup") {
      const target = getMealTarget(value);
      setConstraints((current) => ({
        ...current,
        ageGroup: value,
        minimumCalories: target.calories,
        minimumProtein: target.protein,
      }));
    } else {
      // Keep as string to allow empty field while typing
      setConstraints((current) => ({
        ...current,
        [name]: value,
      }));
    }

    setActiveDatasetId(null);
  }

  function loadDataset(dataset) {
    setDatasetToLoad(dataset);
    setConstraints({
      ageGroup: dataset.constraints.ageGroup,
      budget: String(dataset.constraints.budget),
      studentCount: String(dataset.constraints.studentCount),
    });
    setActiveDatasetId(dataset.id);
    setResult(null);
    setError("");
  }

  const handleSelectionChange = useCallback((selectedFoods) => {
    setFoods(selectedFoods);
  }, []);

  const handleDatasetLoaded = useCallback(() => {
    setDatasetToLoad(null);
  }, []);

  function clearMenuHistory() {
    setMenuHistory([]);
  }

  async function optimizeMenu() {
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadPreview),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to optimize menu.");
      }

      setResult(data);
      if (data.recommended_menu?.length) {
        const menuKey = normalizeMenuKey(data.recommended_menu);
        setMenuHistory((current) => {
          const nextHistory = [
            {
              menuKey,
              ageGroup: constraints.ageGroup,
              generatedAt: new Date().toISOString(),
              recommendedMenu: data.recommended_menu,
              studentCount: studentCount,
            },
            ...current.filter((entry) => entry.menuKey !== menuKey),
          ];
          return nextHistory.slice(0, MAX_MENU_HISTORY);
        });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <HeroPanel constraints={constraints} currentStatus={currentStatus} />
      <DatasetPanel datasets={sampleDatasets} activeDatasetId={activeDatasetId} onLoadDataset={loadDataset} />

      <FoodDatabasePanel
        datasetToLoad={datasetToLoad}
        onDatasetLoaded={handleDatasetLoaded}
        onSelectionChange={handleSelectionChange}
      />

      <section className="content-grid">
        <ControlsPanel
          constraints={constraints}
          currentAkgPercentages={currentAkgPercentages}
          currentStatus={currentStatus}
          currentTotals={currentTotals}
          foodsCount={foods.length}
          isSubmitting={isSubmitting}
          mealTarget={mealTarget}
          onConstraintChange={handleConstraintChange}
          onOptimize={optimizeMenu}
        />
        <div className="panel">
          <div className="panel-heading">
            <h2>Preview Kandidat</h2>
            <p>{foods.length} bahan terpilih dari database untuk dioptimasi.</p>
          </div>
          {foods.length === 0 ? (
            <div className="empty-state">
              <p>Centang bahan di tabel "Daftar Bahan Makanan" di atas.</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Bahan</th>
                    <th>Kategori</th>
                    <th>Porsi</th>
                    <th>Protein</th>
                    <th>Kalori</th>
                    <th>Lemak</th>
                    <th>Karbo</th>
                    <th>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id}>
                      <td>{food.name}</td>
                      <td>{food.category}</td>
                      <td>{food.portionGrams} g</td>
                      <td>{food.protein} g</td>
                      <td>{food.calories} kcal</td>
                      <td>{food.fat} g</td>
                      <td>{food.carbs} g</td>
                      <td>Rp {food.price.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {error ? <p className="feedback error">{error}</p> : null}
        </div>
      </section>

      <section className="results-grid">
        <ResultsPanel
          historyEntries={menuHistory}
          onClearHistory={clearMenuHistory}
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
      </section>
    </main>
  );
}

export default App;
