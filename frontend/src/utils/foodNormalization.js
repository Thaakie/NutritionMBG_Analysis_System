function toNumber(value) {
  if (value === "" || value === undefined || value === null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickValue(source, keys, fallback = undefined) {
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }

  return fallback;
}

export function normalizeFoodRecord(food) {
  const source = food || {};

  return {
    id: pickValue(source, ["id"], null),
    name: String(pickValue(source, ["name"], "")).trim(),
    category: String(pickValue(source, ["category"], "Lainnya") || "Lainnya").trim() || "Lainnya",
    portionScale: String(pickValue(source, ["portionScale", "portion_scale"], "custom") || "custom"),
    portionGrams: toNumber(pickValue(source, ["portionGrams", "portion_grams"])),
    protein: toNumber(pickValue(source, ["protein", "proteins"])),
    calories: toNumber(pickValue(source, ["calories", "energy"])),
    fat: toNumber(pickValue(source, ["fat"])),
    carbs: toNumber(pickValue(source, ["carbs", "carbohydrate"])),
    price: toNumber(pickValue(source, ["price"])),
  };
}

export function toOptimizerFood(food) {
  const normalized = normalizeFoodRecord(food);

  return {
    id: normalized.id,
    name: normalized.name,
    category: normalized.category,
    portionScale: "custom",
    portionGrams: normalized.portionGrams,
    protein: normalized.protein,
    calories: normalized.calories,
    fat: normalized.fat,
    carbs: normalized.carbs,
    price: normalized.price,
  };
}

export function toApiFood(food) {
  const normalized = normalizeFoodRecord(food);

  return {
    name: normalized.name,
    category: normalized.category,
    portion_grams: normalized.portionGrams,
    protein: normalized.protein,
    calories: normalized.calories,
    fat: normalized.fat,
    carbs: normalized.carbs,
    price: normalized.price,
  };
}

