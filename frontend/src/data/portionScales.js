/**
 * Portion unit definitions.
 * Each unit has a base weight in grams so the UI can auto-convert
 * "2 butir" → 120 g, "1 buah" → 150 g, etc.
 */
export const portionUnits = [
  { value: "gram", label: "Gram (g)", gramsPerUnit: 1 },
  { value: "butir", label: "Butir", gramsPerUnit: 60 },
  { value: "buah", label: "Buah", gramsPerUnit: 150 },
  { value: "potong", label: "Potong", gramsPerUnit: 50 },
  { value: "sendok_makan", label: "Sendok Makan (sdm)", gramsPerUnit: 15 },
  { value: "gelas", label: "Gelas (250 ml)", gramsPerUnit: 250 },
  { value: "ikat", label: "Ikat", gramsPerUnit: 100 },
  { value: "lembar", label: "Lembar", gramsPerUnit: 20 },
  { value: "mangkuk", label: "Mangkuk", gramsPerUnit: 200 },
];

/**
 * Per-food overrides for gramsPerUnit.
 * When the user types a food name that matches (case-insensitive, partial match),
 * these overrides replace the default gramsPerUnit for the matching unit.
 *
 * Example: "Telur" + unit "butir" → 60 g/butir instead of default.
 */
export const foodUnitOverrides = {
  // Telur variants
  "telur": { butir: 60 },
  "telur ayam": { butir: 60 },
  "telur bebek": { butir: 70 },
  "telur puyuh": { butir: 15 },
  "telur rebus": { butir: 60 },

  // Buah-buahan
  "pisang": { buah: 80, potong: 40 },
  "apel": { buah: 180 },
  "jeruk": { buah: 130 },
  "pepaya": { buah: 500, potong: 100 },
  "mangga": { buah: 250 },
  "alpukat": { buah: 200 },
  "semangka": { potong: 200 },
  "melon": { potong: 150 },
  "anggur": { buah: 8 },
  "tomat": { buah: 80 },
  "jambu biji": { buah: 150 },
  "nanas": { potong: 100 },
  "durian": { buah: 600, potong: 100 },
  "salak": { buah: 30 },

  // Makanan pokok
  "nasi": { mangkuk: 200, sendok_makan: 20 },
  "roti": { lembar: 35 },
  "roti tawar": { lembar: 35 },

  // Lauk
  "tahu": { potong: 80, buah: 80 },
  "tempe": { potong: 50 },
  "ayam": { potong: 60 },
  "ikan": { potong: 75, buah: 75 },
  "bakso": { buah: 25, butir: 25 },
  "sosis": { buah: 40, potong: 40, batang: 40 },
  "nugget": { potong: 20, buah: 20 },

  // Sayuran
  "wortel": { buah: 100, potong: 30 },
  "kentang": { buah: 150, potong: 50 },
  "bawang merah": { buah: 15, butir: 15 },
  "bawang putih": { buah: 5, butir: 5 },
};

/**
 * Look up the grams-per-unit for a given food name + unit.
 * Falls back to the default gramsPerUnit from portionUnits.
 */
export function getGramsPerUnit(foodName, unitValue) {
  const unitDef = portionUnits.find((u) => u.value === unitValue);
  if (!unitDef) return 1;

  const defaultGrams = unitDef.gramsPerUnit;
  if (!foodName) return defaultGrams;

  const lowerName = foodName.trim().toLowerCase();

  // 1) Exact match
  if (lowerName in foodUnitOverrides) {
    const overrides = foodUnitOverrides[lowerName];
    if (unitValue in overrides) return overrides[unitValue];
  }

  // 2) Food name contains a key (longest key first for specificity)
  const sortedKeys = Object.keys(foodUnitOverrides).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lowerName.includes(key)) {
      const overrides = foodUnitOverrides[key];
      if (unitValue in overrides) return overrides[unitValue];
    }
  }

  return defaultGrams;
}

// ── Legacy exports (kept for backward compatibility) ─────────────
export const portionScaleOptions = [
  { value: "30", label: "Sangat kecil - 30 g", grams: 30 },
  { value: "50", label: "Kecil - 50 g", grams: 50 },
  { value: "75", label: "Sedang kecil - 75 g", grams: 75 },
  { value: "100", label: "Sedang - 100 g", grams: 100 },
  { value: "150", label: "Besar - 150 g", grams: 150 },
  { value: "200", label: "Ekstra besar - 200 g", grams: 200 },
  { value: "1 butir", label: "1 butir (±50 g)", grams: 50 },
  { value: "2 butir", label: "2 butir (±100 g)", grams: 100 },
  { value: "1 buah", label: "1 buah (±150 g)", grams: 150 },
  { value: "1/2 buah", label: "1/2 buah (±75 g)", grams: 75 },
  { value: "custom", label: "Custom", grams: null },
];

export function findPortionScale(value) {
  return portionScaleOptions.find((option) => option.value === value) || portionScaleOptions.at(-1);
}
