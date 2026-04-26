export const portionScaleOptions = [
  { value: "30", label: "Sangat kecil - 30 g", grams: 30 },
  { value: "50", label: "Kecil - 50 g", grams: 50 },
  { value: "75", label: "Sedang kecil - 75 g", grams: 75 },
  { value: "100", label: "Sedang - 100 g", grams: 100 },
  { value: "150", label: "Besar - 150 g", grams: 150 },
  { value: "200", label: "Ekstra besar - 200 g", grams: 200 },
  { value: "custom", label: "Custom", grams: null },
];

export function findPortionScale(value) {
  return portionScaleOptions.find((option) => option.value === value) || portionScaleOptions.at(-1);
}
