import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./styles/ui.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import DatabasePage from "./pages/DatabasePage";
import OptimizePage from "./pages/OptimizePage";
import ResultsPage from "./pages/ResultsPage";
import { getMealTarget } from "./data/akgProfiles";
import { sampleDatasets } from "./data/sampleDatasets";
import { createFoodInDb, fetchOptimizationHistory } from "./services/api";
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

function isSameLocalDay(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function isMilkFoodName(value) {
  return String(value || "").toLowerCase().includes("susu");
}

function isRiceFoodName(value) {
  return String(value || "").toLowerCase().includes("nasi");
}

function getMissingCoreCategories(foods) {
  const categories = new Set((foods || []).map((item) => item.category || "Lainnya"));
  const hasMain = categories.has("Makanan Pokok");
  const hasLauk = categories.has("Lauk Pauk") || categories.has("Lauk Hewani") || categories.has("Lauk Nabati");
  const hasVeg = categories.has("Sayuran");

  const missing = [];
  if (!hasMain) missing.push("Makanan Pokok");
  if (!hasLauk) missing.push("Lauk");
  if (!hasVeg) missing.push("Sayuran");
  return missing;
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

function mapDbToOptimizer(food) {
  return {
    id: food.id,
    name: food.name,
    category: food.category || "Lainnya",
    portionScale: "custom",
    portionGrams: parseNum(food.portion_grams),
    protein: parseNum(food.protein),
    calories: parseNum(food.calories),
    fat: parseNum(food.fat),
    carbs: parseNum(food.carbs),
    price: parseNum(food.price),
  };
}

function DashboardLayout({ foodsCount, resultReady, dashboardUpdatePending, onDashboardSeen }) {
  return (
    <div className="app-layout">
      <Sidebar
        foodsCount={foodsCount}
        resultReady={resultReady}
        dashboardUpdatePending={dashboardUpdatePending}
        onDashboardSeen={onDashboardSeen}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [foods, setFoods] = useState([]);
  const [constraints, setConstraints] = useState({
    ageGroup: defaultDataset.constraints.ageGroup,
    budget: String(defaultDataset.constraints.budget),
    studentCount: String(defaultDataset.constraints.studentCount),
  });
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  // Signal to FoodDatabasePanel to refresh + auto-select these food names
  const [datasetFoodNames, setDatasetFoodNames] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardUpdatePending, setDashboardUpdatePending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isDatasetLoading, setIsDatasetLoading] = useState(false);
  const [menuHistory, setMenuHistory] = useState(readMenuHistory);
  const [optimizationHistory, setOptimizationHistory] = useState([]);

  const pushToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const hasSameToast = prev.some((toast) => toast.message === message && toast.type === type);
      if (hasSameToast) return prev;
      return [...prev, { id, message, type }];
    });
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2400);
  }, []);

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

  const weeklyMilkRestrictedNames = useMemo(() => {
    const milkNames = new Set();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    menuHistory.forEach((entry) => {
      const generatedAt = new Date(entry.generatedAt).getTime();
      if (!Number.isFinite(generatedAt) || generatedAt < sevenDaysAgo) return;
      (entry.recommendedMenu || []).forEach((name) => {
        if (isMilkFoodName(name)) {
          milkNames.add(name);
        }
      });
    });

    return [...milkNames];
  }, [menuHistory]);

  const payloadExcludedMenus = useMemo(() => {
    const filteredHistoryMenus = menuHistory
      .map((entry) => (entry.recommendedMenu || []).filter((name) => !isRiceFoodName(name)))
      .filter((menu) => menu.length > 0);
    const weeklyMilkMenus = weeklyMilkRestrictedNames.map((milkName) => [milkName]);
    return [...filteredHistoryMenus, ...weeklyMilkMenus];
  }, [menuHistory, weeklyMilkRestrictedNames]);

  const payloadPreview = useMemo(
    () => ({
      budget,
      age_group: constraints.ageGroup,
      excluded_menus: payloadExcludedMenus,
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
    [constraints.ageGroup, budget, studentCount, foods, mealTarget.calories, mealTarget.protein, payloadExcludedMenus],
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

  const loadOptimizationHistory = useCallback(async () => {
    try {
      const items = await fetchOptimizationHistory(200);
      setOptimizationHistory(Array.isArray(items) ? items : []);
    } catch {
      setOptimizationHistory([]);
    }
  }, []);

  useEffect(() => {
    loadOptimizationHistory();
  }, [loadOptimizationHistory]);

  function handleConstraintChange(event) {
    const { name, value } = event.target;
    if (name === "ageGroup") {
      const target = getMealTarget(value);
      setConstraints((c) => ({ ...c, ageGroup: value, minimumCalories: target.calories, minimumProtein: target.protein }));
    } else {
      setConstraints((c) => ({ ...c, [name]: value }));
    }
    setActiveDatasetId(null);
  }

  function applyQaScenario(scenarioId) {
    if (scenarioId === "budget-tight") {
      setConstraints((c) => ({ ...c, budget: "12000" }));
      pushToast("Skenario QA aktif: Budget ketat.");
      return;
    }
    if (scenarioId === "protein-high") {
      setConstraints((c) => ({ ...c, ageGroup: "13-15", budget: "22000" }));
      pushToast("Skenario QA aktif: Protein tinggi.");
      return;
    }
    if (scenarioId === "limited-foods") {
      setConstraints((c) => ({ ...c, budget: "15000" }));
      setFoods((prev) => prev.slice(0, Math.min(prev.length, 6)));
      pushToast("Skenario QA aktif: Bahan terbatas.");
    }
  }

  // Load dataset: insert foods into DB here (not in effect), then signal panel to refresh
  async function loadDataset(dataset) {
    if (isDatasetLoading) return;
    setIsDatasetLoading(true);
    setConstraints({
      ageGroup: dataset.constraints.ageGroup,
      budget: String(dataset.constraints.budget),
      studentCount: String(dataset.constraints.studentCount),
    });
    setActiveDatasetId(dataset.id);
    setResult(null);
    setError("");

    try {
      // Insert dataset foods into DB (backend has duplicate guard by food name)
      for (const food of dataset.foods) {
        try {
          await createFoodInDb({
            name: food.name,
            category: food.category || "Lainnya",
            portion_grams: food.portionGrams,
            protein: food.protein,
            calories: food.calories,
            fat: food.fat,
            carbs: food.carbs,
            price: food.price,
          });
        } catch {
          /* skip */
        }
      }
      pushToast(`Dataset demo aktif: ${dataset.name}. Kandidat bahan disiapkan.`, "success");
    } finally {
      setIsDatasetLoading(false);
    }

    // Signal FoodDatabasePanel to refresh and auto-select these names
    setDatasetFoodNames(dataset.foods.map((f) => f.name));
  }

  const handleSelectionChange = useCallback((selectedFoods) => setFoods(selectedFoods), []);
  const handleDatasetApplied = useCallback(() => setDatasetFoodNames(null), []);

  // Remove a single food from selection (for OptimizePage preview)
  const removeFood = useCallback((foodId) => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));
  }, []);

  function clearMenuHistory() {
    setMenuHistory([]);
  }

  async function optimizeMenu() {
    const missingCore = getMissingCoreCategories(foods);
    if (missingCore.length > 0) {
      const message = `Optimasi dibatalkan: komposisi belum lengkap (${missingCore.join(", ")}).`;
      setError(message);
      pushToast(message, "error");
      return;
    }

    if (currentTotals.totalCalories < mealTarget.calories) {
      const message = `Optimasi dibatalkan: total kalori kandidat (${Math.round(currentTotals.totalCalories)} kcal) masih di bawah minimum (${Math.round(mealTarget.calories)} kcal).`;
      setError(message);
      pushToast(message, "error");
      return;
    }

    if (currentTotals.totalProtein < mealTarget.protein) {
      const message = `Optimasi dibatalkan: total protein kandidat (${currentTotals.totalProtein.toFixed(1)} g) masih di bawah minimum (${mealTarget.protein.toFixed(1)} g).`;
      setError(message);
      pushToast(message, "error");
      return;
    }

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
      if (!response.ok) throw new Error(data.error || "Unable to optimize menu.");

      setResult(data);
      setDashboardUpdatePending(true);
      pushToast("Optimasi selesai. Dashboard dan hasil analisis diperbarui.", "success");
      await loadOptimizationHistory();
      if (data.recommended_menu?.length) {
        const menuKey = normalizeMenuKey(data.recommended_menu);
        setMenuHistory((current) => {
          const nextHistory = [
            {
              menuKey,
              ageGroup: constraints.ageGroup,
              generatedAt: new Date().toISOString(),
              recommendedMenu: data.recommended_menu,
              studentCount,
              totalCost: data.total_cost || 0,
              totalCalories: data.total_calories || 0,
            },
            ...current.filter((entry) => entry.menuKey !== menuKey),
          ];
          return nextHistory.slice(0, MAX_MENU_HISTORY);
        });
      }
    } catch (requestError) {
      setError(requestError.message);
      pushToast("Optimasi gagal. Periksa data bahan atau koneksi layanan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const dashboardSummary = useMemo(() => {
    const optimizedTodayCount = optimizationHistory.filter((item) => isSameLocalDay(item.created_at)).length;
    return {
      optimizedTodayCount,
      historyItems: optimizationHistory,
    };
  }, [optimizationHistory]);

  return (
    <BrowserRouter>
      {toasts.length > 0 ? (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <article className={`toast-item ${toast.type === "error" ? "toast-error" : "toast-success"}`} key={toast.id}>{toast.message}</article>
          ))}
        </div>
      ) : null}
      <Routes>
        <Route
          element={(
            <DashboardLayout
              foodsCount={foods.length}
              resultReady={!!result}
              dashboardUpdatePending={dashboardUpdatePending}
              onDashboardSeen={() => setDashboardUpdatePending(false)}
            />
          )}
        >
          <Route
            index
            element={
              <DashboardPage
                constraints={constraints}
                currentStatus={currentStatus}
                currentTotals={currentTotals}
                currentAkgPercentages={currentAkgPercentages}
                mealTarget={mealTarget}
                foodsCount={foods.length}
                activeDatasetId={activeDatasetId}
                onLoadDataset={loadDataset}
                isDatasetLoading={isDatasetLoading}
                result={result}
                dashboardSummary={dashboardSummary}
                onApplyQaScenario={applyQaScenario}
              />
            }
          />
          <Route
            path="database"
            element={
              <DatabasePage
                datasetFoodNames={datasetFoodNames}
                onDatasetApplied={handleDatasetApplied}
                onSelectionChange={handleSelectionChange}
                selectedFoodIds={foods.map((food) => food.id)}
                onNotify={pushToast}
              />
            }
          />
          <Route
            path="optimize"
            element={
              <OptimizePage
                constraints={constraints}
                currentTotals={currentTotals}
                currentAkgPercentages={currentAkgPercentages}
                currentStatus={currentStatus}
                mealTarget={mealTarget}
                foods={foods}
                isSubmitting={isSubmitting}
                error={error}
                onConstraintChange={handleConstraintChange}
                onOptimize={optimizeMenu}
                onRemoveFood={removeFood}
              />
            }
          />
          <Route
            path="results"
            element={
              <ResultsPage
                result={result}
                recommendedFoods={recommendedFoods}
                menuHistory={menuHistory}
                onClearHistory={clearMenuHistory}
                currentAkgPercentages={currentAkgPercentages}
                currentStatus={currentStatus}
                currentTotals={currentTotals}
                mealTarget={mealTarget}
                payloadPreview={payloadPreview}
                recommendedBatch={recommendedBatch}
                recommendedBatchTotals={recommendedBatchTotals}
                studentCount={studentCount}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
