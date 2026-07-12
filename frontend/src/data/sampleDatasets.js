import { getMealTarget } from "./akgProfiles";

const balitaTarget = getMealTarget("BALITA");
const ibuHamilTarget = getMealTarget("IBU_HAMIL");
const lansiaTarget = getMealTarget("LANSIA");

export const sampleDatasets = [
  {
    id: "balita-umum",
    name: "Menu Balita",
    description: "Contoh kandidat menu untuk balita berdasarkan AKG Permenkes 28/2019.",
    constraints: {
      ageGroup: "BALITA",
      budget: 15000,
      studentCount: 1,
      minimumCalories: balitaTarget.calories,
      minimumProtein: balitaTarget.protein,
    },
    foods: [
      { id: 101, name: "Nasi", category: "Makanan Pokok", portionGrams: 100, protein: 4, calories: 180, fat: 0.4, carbs: 40, price: 2500 },
      { id: 102, name: "Ayam", category: "Lauk Pauk", portionGrams: 60, protein: 18, calories: 240, fat: 14, carbs: 0, price: 8000 },
      { id: 103, name: "Tempe", category: "Lauk Pauk", portionGrams: 50, protein: 10, calories: 190, fat: 11, carbs: 9, price: 3000 },
      { id: 104, name: "Sayur Bayam", category: "Sayuran", portionGrams: 70, protein: 3, calories: 60, fat: 1, carbs: 9, price: 1500 },
      { id: 105, name: "Pisang", category: "Buah-buahan", portionGrams: 80, protein: 1, calories: 90, fat: 0.3, carbs: 23, price: 2000 },
      { id: 106, name: "Wortel Kukus", category: "Sayuran", portionGrams: 65, protein: 1.2, calories: 35, fat: 0.2, carbs: 8, price: 1200 },
    ],
  },
  {
    id: "ibu-hamil-umum",
    name: "Menu Ibu Hamil",
    description: "Contoh kandidat menu untuk ibu hamil dengan target trimester 2 sebagai acuan utama.",
    constraints: {
      ageGroup: "IBU_HAMIL",
      budget: 25000,
      studentCount: 1,
      minimumCalories: ibuHamilTarget.calories,
      minimumProtein: ibuHamilTarget.protein,
    },
    foods: [
      { id: 151, name: "Nasi Putih", category: "Makanan Pokok", portionGrams: 110, protein: 4.1, calories: 190, fat: 0.5, carbs: 42, price: 2600 },
      { id: 152, name: "Telur Dadar", category: "Lauk Pauk", portionGrams: 60, protein: 8, calories: 120, fat: 8, carbs: 1, price: 3200 },
      { id: 153, name: "Ayam Bumbu Kuning", category: "Lauk Pauk", portionGrams: 65, protein: 18, calories: 205, fat: 11, carbs: 2, price: 7800 },
      { id: 154, name: "Tumis Buncis", category: "Sayuran", portionGrams: 75, protein: 2.2, calories: 55, fat: 2, carbs: 8, price: 1800 },
      { id: 155, name: "Pisang Ambon", category: "Buah-buahan", portionGrams: 85, protein: 1, calories: 95, fat: 0.3, carbs: 24, price: 2200 },
      { id: 156, name: "Susu UHT Plain", category: "Susu & Produk Susu", portionGrams: 200, protein: 6.2, calories: 130, fat: 7, carbs: 12, price: 4800 },
      { id: 157, name: "Tempe Kukus", category: "Lauk Pauk", portionGrams: 55, protein: 10, calories: 160, fat: 8, carbs: 9, price: 2900 },
    ],
  },
  {
    id: "lansia-umum",
    name: "Menu Lansia",
    description: "Contoh kandidat menu untuk lansia berdasarkan AKG Permenkes 28/2019.",
    constraints: {
      ageGroup: "LANSIA",
      budget: 22000,
      studentCount: 1,
      minimumCalories: lansiaTarget.calories,
      minimumProtein: lansiaTarget.protein,
    },
    foods: [
      { id: 201, name: "Nasi Merah", category: "Makanan Pokok", portionScale: "150", portionGrams: 150, protein: 5, calories: 220, fat: 1.5, carbs: 46, price: 3200 },
      { id: 202, name: "Telur Rebus", category: "Lauk Pauk", portionScale: "1 butir", portionGrams: 55, protein: 7, calories: 80, fat: 5, carbs: 0.6, price: 2500 },
      { id: 203, name: "Ikan Kembung", category: "Lauk Pauk", portionScale: "75", portionGrams: 75, protein: 17, calories: 190, fat: 11, carbs: 0, price: 7000 },
      { id: 204, name: "Tempe Bacem", category: "Lauk Pauk", portionScale: "60", portionGrams: 60, protein: 9, calories: 170, fat: 8, carbs: 13, price: 3000 },
      { id: 205, name: "Susu UHT", category: "Susu & Produk Susu", portionScale: "200", portionGrams: 200, protein: 6, calories: 130, fat: 7, carbs: 12, price: 4500 },
      { id: 206, name: "Tumis Kangkung", category: "Sayuran", portionScale: "70", portionGrams: 70, protein: 3, calories: 70, fat: 3, carbs: 8, price: 2000 },
      { id: 207, name: "Pepaya", category: "Buah-buahan", portionScale: "1/2 buah", portionGrams: 90, protein: 1, calories: 60, fat: 0.2, carbs: 15, price: 1800 },
      { id: 208, name: "Capcay", category: "Sayuran", portionScale: "80", portionGrams: 80, protein: 2.5, calories: 65, fat: 2, carbs: 10, price: 2200 },
    ],
  },
];
