require("dotenv").config();

const { closePool, createFood, initializeDatabase, listFoods } = require("../db");

const seedFoods = [
  { name: "Nasi", category: "Makanan Pokok", portion_grams: 100, protein: 4, calories: 180, fat: 0.4, carbs: 40, price: 2500 },
  { name: "Nasi Merah", category: "Makanan Pokok", portion_grams: 150, protein: 5, calories: 220, fat: 1.5, carbs: 46, price: 3200 },
  { name: "Nasi Jagung", category: "Makanan Pokok", portion_grams: 120, protein: 4, calories: 170, fat: 1.2, carbs: 35, price: 2200 },
  { name: "Ayam", category: "Lauk Pauk", portion_grams: 60, protein: 18, calories: 240, fat: 14, carbs: 0, price: 8000 },
  { name: "Ayam Panggang", category: "Lauk Pauk", portion_grams: 70, protein: 20, calories: 210, fat: 12, carbs: 1, price: 8500 },
  { name: "Tempe", category: "Lauk Pauk", portion_grams: 50, protein: 10, calories: 190, fat: 11, carbs: 9, price: 3000 },
  { name: "Tempe Bacem", category: "Lauk Pauk", portion_grams: 60, protein: 9, calories: 170, fat: 8, carbs: 13, price: 3000 },
  { name: "Tempe Goreng", category: "Lauk Pauk", portion_grams: 60, protein: 9, calories: 180, fat: 11, carbs: 10, price: 2800 },
  { name: "Tahu", category: "Lauk Pauk", portion_grams: 55, protein: 8, calories: 120, fat: 7, carbs: 3, price: 2500 },
  { name: "Tahu Goreng", category: "Lauk Pauk", portion_grams: 60, protein: 8, calories: 140, fat: 9, carbs: 4, price: 2500 },
  { name: "Telur Rebus", category: "Lauk Pauk", portion_grams: 55, protein: 7, calories: 80, fat: 5, carbs: 0.6, price: 2500 },
  { name: "Ikan Kembung", category: "Lauk Pauk", portion_grams: 75, protein: 17, calories: 190, fat: 11, carbs: 0, price: 7000 },
  { name: "Sayur Bayam", category: "Sayuran", portion_grams: 70, protein: 3, calories: 60, fat: 1, carbs: 9, price: 1500 },
  { name: "Wortel Kukus", category: "Sayuran", portion_grams: 65, protein: 1.2, calories: 35, fat: 0.2, carbs: 8, price: 1200 },
  { name: "Tumis Kangkung", category: "Sayuran", portion_grams: 70, protein: 3, calories: 70, fat: 3, carbs: 8, price: 2000 },
  { name: "Capcay", category: "Sayuran", portion_grams: 80, protein: 2.5, calories: 65, fat: 2, carbs: 10, price: 2200 },
  { name: "Sayur Sop", category: "Sayuran", portion_grams: 90, protein: 2, calories: 55, fat: 1, carbs: 10, price: 1500 },
  { name: "Buncis Rebus", category: "Sayuran", portion_grams: 75, protein: 2.1, calories: 45, fat: 0.2, carbs: 8, price: 1600 },
  { name: "Pisang", category: "Buah-buahan", portion_grams: 80, protein: 1, calories: 90, fat: 0.3, carbs: 23, price: 2000 },
  { name: "Pepaya", category: "Buah-buahan", portion_grams: 90, protein: 1, calories: 60, fat: 0.2, carbs: 15, price: 1800 },
  { name: "Jeruk", category: "Buah-buahan", portion_grams: 90, protein: 1, calories: 70, fat: 0.2, carbs: 17, price: 1800 },
  { name: "Susu UHT", category: "Susu & Produk Susu", portion_grams: 200, protein: 6, calories: 130, fat: 7, carbs: 12, price: 4500 },
  { name: "Susu Kedelai", category: "Susu & Produk Susu", portion_grams: 200, protein: 7, calories: 110, fat: 4, carbs: 12, price: 3500 },
];

async function main() {
  await initializeDatabase();

  const existingFoods = await listFoods();
  if (existingFoods.length > 0) {
    console.log(`Database already has ${existingFoods.length} food(s). Skipping seed.`);
    return;
  }

  console.log(`Seeding ${seedFoods.length} foods...`);
  for (const food of seedFoods) {
    const created = await createFood(food);
    console.log(`  + ${created.name} (id: ${created.id})`);
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  })
  .finally(() => closePool());
