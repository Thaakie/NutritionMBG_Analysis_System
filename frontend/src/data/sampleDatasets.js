import { getMealTarget } from "./akgProfiles";

const elementaryTarget = getMealTarget("7-9");
const middleTarget = getMealTarget("13-15");
const teenTarget = getMealTarget("16-18");

export const sampleDatasets = [
  {
    id: "elementary-lunch",
    name: "Elementary Lunch",
    description: "Balanced low-cost lunch set for elementary students.",
    constraints: {
      ageGroup: "7-9",
      budget: 15000,
      studentCount: 1,
      minimumCalories: elementaryTarget.calories,
      minimumProtein: elementaryTarget.protein,
    },
    foods: [
      { id: 101, name: "Nasi", category: "Makanan Pokok", portionGrams: 100, protein: 4, calories: 180, fat: 0.4, carbs: 40, price: 2500 },
      { id: 102, name: "Ayam", category: "Lauk Pauk", portionGrams: 60, protein: 18, calories: 240, fat: 14, carbs: 0, price: 8000 },
      { id: 103, name: "Tempe", category: "Lauk Pauk", portionGrams: 50, protein: 10, calories: 190, fat: 11, carbs: 9, price: 3000 },
      { id: 104, name: "Tahu", category: "Lauk Pauk", portionGrams: 55, protein: 8, calories: 120, fat: 7, carbs: 3, price: 2500 },
      { id: 105, name: "Sayur Bayam", category: "Sayuran", portionGrams: 70, protein: 3, calories: 60, fat: 1, carbs: 9, price: 1500 },
      { id: 106, name: "Pisang", category: "Buah-buahan", portionGrams: 80, protein: 1, calories: 90, fat: 0.3, carbs: 23, price: 2000 },
      { id: 107, name: "Wortel Kukus", category: "Sayuran", portionGrams: 65, protein: 1.2, calories: 35, fat: 0.2, carbs: 8, price: 1200 },
    ],
  },
  {
    id: "middle-school",
    name: "Middle School",
    description: "More energy and protein for older students with active schedules.",
    constraints: {
      ageGroup: "13-15",
      budget: 22000,
      studentCount: 1,
      minimumCalories: middleTarget.calories,
      minimumProtein: middleTarget.protein,
    },
    foods: [
      { id: 201, name: "Nasi Merah", category: "Makanan Pokok", portionGrams: 120, protein: 5, calories: 220, fat: 1.5, carbs: 46, price: 3200 },
      { id: 202, name: "Telur Rebus", category: "Lauk Pauk", portionGrams: 55, protein: 7, calories: 80, fat: 5, carbs: 0.6, price: 2500 },
      { id: 203, name: "Ikan Kembung", category: "Lauk Pauk", portionGrams: 75, protein: 17, calories: 190, fat: 11, carbs: 0, price: 7000 },
      { id: 204, name: "Tempe Bacem", category: "Lauk Pauk", portionGrams: 60, protein: 9, calories: 170, fat: 8, carbs: 13, price: 3000 },
      { id: 205, name: "Susu UHT", category: "Susu & Produk Susu", portionGrams: 200, protein: 6, calories: 130, fat: 7, carbs: 12, price: 4500 },
      { id: 206, name: "Tumis Kangkung", category: "Sayuran", portionGrams: 70, protein: 3, calories: 70, fat: 3, carbs: 8, price: 2000 },
      { id: 207, name: "Pepaya", category: "Buah-buahan", portionGrams: 90, protein: 1, calories: 60, fat: 0.2, carbs: 15, price: 1800 },
      { id: 208, name: "Capcay", category: "Sayuran", portionGrams: 80, protein: 2.5, calories: 65, fat: 2, carbs: 10, price: 2200 },
    ],
  },
  {
    id: "senior-budget",
    name: "Senior Budget Mix",
    description: "Cost-aware candidates for upper-grade students while keeping AKG tracking visible.",
    constraints: {
      ageGroup: "16-18",
      budget: 24000,
      studentCount: 1,
      minimumCalories: teenTarget.calories,
      minimumProtein: teenTarget.protein,
    },
    foods: [
      { id: 301, name: "Nasi Jagung", category: "Makanan Pokok", portionGrams: 120, protein: 4, calories: 170, fat: 1.2, carbs: 35, price: 2200 },
      { id: 302, name: "Ayam Panggang", category: "Lauk Pauk", portionGrams: 70, protein: 20, calories: 210, fat: 12, carbs: 1, price: 8500 },
      { id: 303, name: "Tahu Goreng", category: "Lauk Pauk", portionGrams: 60, protein: 8, calories: 140, fat: 9, carbs: 4, price: 2500 },
      { id: 304, name: "Tempe Goreng", category: "Lauk Pauk", portionGrams: 60, protein: 9, calories: 180, fat: 11, carbs: 10, price: 2800 },
      { id: 305, name: "Sayur Sop", category: "Sayuran", portionGrams: 90, protein: 2, calories: 55, fat: 1, carbs: 10, price: 1500 },
      { id: 306, name: "Jeruk", category: "Buah-buahan", portionGrams: 90, protein: 1, calories: 70, fat: 0.2, carbs: 17, price: 1800 },
      { id: 307, name: "Susu Kedelai", category: "Susu & Produk Susu", portionGrams: 200, protein: 7, calories: 110, fat: 4, carbs: 12, price: 3500 },
      { id: 308, name: "Buncis Rebus", category: "Sayuran", portionGrams: 75, protein: 2.1, calories: 45, fat: 0.2, carbs: 8, price: 1600 },
    ],
  },
];
