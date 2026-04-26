import { useMemo, useState } from "react";
import "./styles/ui.css";
import "./App.css";
import ControlsPanel from "./components/ControlsPanel";
import DatasetPanel from "./components/DatasetPanel";
import HeroPanel from "./components/HeroPanel";
import MenuInputPanel from "./components/MenuInputPanel";
import ResultsPanel from "./components/ResultsPanel";
import SummaryPanel from "./components/SummaryPanel";
import { getMealTarget } from "./data/akgProfiles";
import { foodCategoryOptions } from "./data/foodCategories";
import { findPortionScale } from "./data/portionScales";
import { sampleDatasets } from "./data/sampleDatasets";
import {
  calculateAkgPercentages,
  calculateBatchTotals,
  calculateTotals,
  classifyFeasibility,
  scaleFoodsForStudents,
} from "./utils/nutrition";

const initialFoodForm = {
  name: "",
  category: foodCategoryOptions.at(-1),
  portionScale: "custom",
  portionGrams: "",
  protein: "",
  calories: "",
  fat: "",
  carbs: "",
  price: "",
};

const defaultDataset = sampleDatasets[0];

function App() {
  const [foods, setFoods] = useState(defaultDataset.foods);
  const [foodForm, setFoodForm] = useState(initialFoodForm);
  const [constraints, setConstraints] = useState(defaultDataset.constraints);
  const [activeDatasetId, setActiveDatasetId] = useState(defaultDataset.id);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTotals = useMemo(() => calculateTotals(foods), [foods]);
  const mealTarget = useMemo(() => getMealTarget(constraints.ageGroup), [constraints.ageGroup]);
  const currentAkgPercentages = useMemo(
    () => calculateAkgPercentages(currentTotals, constraints.ageGroup),
    [constraints.ageGroup, currentTotals],
  );
  const currentStatus = useMemo(
    () => classifyFeasibility(currentTotals, currentAkgPercentages, constraints.budget),
    [constraints.budget, currentAkgPercentages, currentTotals],
  );

  const payloadPreview = useMemo(
    () => ({
      budget: constraints.budget,
      age_group: constraints.ageGroup,
      student_count: constraints.studentCount,
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
    [constraints.ageGroup, constraints.budget, foods, mealTarget.calories, mealTarget.protein],
  );

  const recommendedFoods = useMemo(() => {
    if (!result?.recommended_menu) {
      return [];
    }

    return foods.filter((food) => result.recommended_menu.includes(food.name));
  }, [foods, result]);
  const recommendedBatch = useMemo(
    () => scaleFoodsForStudents(recommendedFoods, constraints.studentCount),
    [constraints.studentCount, recommendedFoods],
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
        constraints.studentCount,
      ),
    [constraints.studentCount, result],
  );

  function handleFoodFormChange(event) {
    const { name, value } = event.target;

    if (name === "portionScale") {
      const selectedScale = findPortionScale(value);
      setFoodForm((current) => ({
        ...current,
        portionScale: value,
        portionGrams: selectedScale.grams ?? current.portionGrams,
      }));
      return;
    }

    setFoodForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleConstraintChange(event) {
    const { name, value } = event.target;

    if (name === "ageGroup") {
      const mealTarget = getMealTarget(value);
      setConstraints((current) => ({
        ...current,
        ageGroup: value,
        minimumCalories: mealTarget.calories,
        minimumProtein: mealTarget.protein,
      }));
    } else {
      setConstraints((current) => ({
        ...current,
        [name]: Number(value),
      }));
    }

    setActiveDatasetId(null);
  }

  function loadDataset(dataset) {
    setFoods(dataset.foods);
    setConstraints(dataset.constraints);
    setActiveDatasetId(dataset.id);
    setResult(null);
    setError("");
  }

  function addFood(event) {
    event.preventDefault();

    const trimmedName = foodForm.name.trim();
    const portionGrams = Number(foodForm.portionGrams);
    const protein = Number(foodForm.protein);
    const calories = Number(foodForm.calories);
    const fat = Number(foodForm.fat);
    const carbs = Number(foodForm.carbs);
    const price = Number(foodForm.price);

    if (!trimmedName) {
      setError("Food name is required.");
      return;
    }

    if ([portionGrams, protein, calories, fat, carbs, price].some((value) => Number.isNaN(value) || value < 0)) {
      setError("Portion, nutrition values, and price must be non-negative numbers.");
      return;
    }

    setFoods((current) => [
      ...current,
      {
        id: Date.now(),
        name: trimmedName,
        category: foodForm.category,
        portionScale: foodForm.portionScale,
        portionGrams,
        protein,
        calories,
        fat,
        carbs,
        price,
      },
    ]);
    setFoodForm(initialFoodForm);
    setActiveDatasetId(null);
    setError("");
  }

  function removeFood(id) {
    setFoods((current) => current.filter((food) => food.id !== id));
    setActiveDatasetId(null);
  }

  async function optimizeMenu() {
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadPreview),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to optimize menu.");
      }

      setResult(data);
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
        <MenuInputPanel
          error={error}
          foodForm={foodForm}
          foods={foods}
          onAddFood={addFood}
          onFoodFormChange={handleFoodFormChange}
          onRemoveFood={removeFood}
        />
      </section>

      <section className="results-grid">
        <ResultsPanel recommendedFoods={recommendedFoods} result={result} />
        <SummaryPanel
          currentAkgPercentages={currentAkgPercentages}
          currentStatus={currentStatus}
          currentTotals={currentTotals}
          mealTarget={mealTarget}
          payloadPreview={payloadPreview}
          recommendedBatch={recommendedBatch}
          recommendedBatchTotals={recommendedBatchTotals}
          studentCount={constraints.studentCount}
          result={result}
        />
      </section>
    </main>
  );
}

export default App;
