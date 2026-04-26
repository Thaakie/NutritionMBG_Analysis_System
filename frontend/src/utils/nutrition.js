import { getMealTarget } from "../data/akgProfiles";

export function calculateTotals(foods) {
  return foods.reduce(
    (totals, food) => ({
      totalProtein: totals.totalProtein + food.protein,
      totalCalories: totals.totalCalories + food.calories,
      totalFat: totals.totalFat + food.fat,
      totalCarbs: totals.totalCarbs + food.carbs,
      totalCost: totals.totalCost + food.price,
    }),
    { totalProtein: 0, totalCalories: 0, totalFat: 0, totalCarbs: 0, totalCost: 0 },
  );
}

export function calculateAkgPercentages(totals, ageGroup) {
  const mealTarget = getMealTarget(ageGroup);

  return {
    calories: Number(((totals.totalCalories / mealTarget.calories) * 100 || 0).toFixed(2)),
    protein: Number(((totals.totalProtein / mealTarget.protein) * 100 || 0).toFixed(2)),
    fat: Number(((totals.totalFat / mealTarget.fat) * 100 || 0).toFixed(2)),
    carbs: Number(((totals.totalCarbs / mealTarget.carbs) * 100 || 0).toFixed(2)),
  };
}

export function classifyFeasibility(totals, akgPercentages, budget) {
  const withinBudget = totals.totalCost <= budget;
  const caloriesOk = akgPercentages.calories >= 100;
  const proteinOk = akgPercentages.protein >= 100;
  const supportMacrosOk = akgPercentages.fat >= 80 && akgPercentages.carbs >= 80;

  if (withinBudget && caloriesOk && proteinOk && supportMacrosOk) {
    return "Layak";
  }

  if (withinBudget && akgPercentages.calories >= 80 && akgPercentages.protein >= 80) {
    return "Perlu optimasi";
  }

  return "Tidak layak";
}

export function scaleFoodsForStudents(foods, studentCount) {
  return foods.map((food) => ({
    ...food,
    totalPortionGrams: Number((food.portionGrams * studentCount).toFixed(2)),
    totalPrice: Number((food.price * studentCount).toFixed(2)),
  }));
}

export function calculateBatchTotals(totals, studentCount) {
  return {
    totalCalories: Number((totals.totalCalories * studentCount).toFixed(2)),
    totalProtein: Number((totals.totalProtein * studentCount).toFixed(2)),
    totalFat: Number((totals.totalFat * studentCount).toFixed(2)),
    totalCarbs: Number((totals.totalCarbs * studentCount).toFixed(2)),
    totalCost: Number((totals.totalCost * studentCount).toFixed(2)),
  };
}
