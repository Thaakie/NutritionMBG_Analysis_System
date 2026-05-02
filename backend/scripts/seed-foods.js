require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { closePool, createFood, initializeDatabase, listFoods } = require("../db");

const CSV_PATH = path.join(__dirname, "..", "data", "nutrition.csv");

// Simple category guesser based on food name keywords
function guessCategory(name) {
  const lower = name.toLowerCase();

  if (/nasi|beras|bubur|lontong|ketupat|jagung|kentang|singkong|ubi|sagu|talas|tepung|roti|mie|mi |bihun|kwetiau|makaroni|spageti/.test(lower)) return "Makanan Pokok";
  if (/ayam|sapi|kambing|babi|daging|ikan|udang|cumi|kepiting|kerang|tongkol|tuna|lele|nila|bandeng|patin|gurame|kakap|cakalang|tenggiri|kembung|teri|sarden|telur|bebek|burung/.test(lower)) return "Lauk Hewani";
  if (/tempe|tahu|kacang|oncom|kedelai/.test(lower)) return "Lauk Nabati";
  if (/bayam|kangkung|sawi|wortel|buncis|kol|kubis|terong|labu|timun|mentimun|tomat|paprika|brokoli|selada|daun|sayur|capcay|tumis|rebung|tauge|jamur/.test(lower)) return "Sayuran";
  if (/pisang|apel|jeruk|mangga|pepaya|semangka|melon|anggur|nanas|durian|rambutan|salak|jambu|alpukat|strawber|blueberry|kiwi|buah/.test(lower)) return "Buah-buahan";
  if (/susu|yoghurt|keju|mentega/.test(lower)) return "Susu & Produk Susu";
  if (/kue|biskuit|roti|donat|cake|puding|es krim|cokelat|permen|selai|gula|madu|sirup|wingko|yangko|dodol|lemper|risoles|pastel|bakwan|getuk|klepon|onde/.test(lower)) return "Jajanan & Kue";
  if (/teh|kopi|jus|sirup|air|minuman|soda|cola|fanta|sprite/.test(lower)) return "Minuman";
  if (/minyak|santan|margarin|kelapa|lemak|gajih/.test(lower)) return "Minyak & Lemak";
  if (/sambal|kecap|saus|garam|merica|kunyit|jahe|bawang|cabai|cabe|ketumbar|pala|cengkeh|kayu manis|andaliman|kemiri/.test(lower)) return "Bumbu & Rempah";

  return "Lainnya";
}

function parseCsvLine(line) {
  // Handle potential commas inside fields (image URLs shouldn't have commas, but be safe)
  const parts = line.split(",");
  if (parts.length < 7) return null;

  const id = parseInt(parts[0], 10);
  const calories = parseFloat(parts[1]) || 0;
  const proteins = parseFloat(parts[2]) || 0;
  const fat = parseFloat(parts[3]) || 0;
  const carbohydrate = parseFloat(parts[4]) || 0;
  const name = parts[5] || "";

  if (!name.trim() || isNaN(id)) return null;

  return { id, calories, proteins, fat, carbohydrate, name: name.trim() };
}

async function main() {
  await initializeDatabase();

  const existingFoods = await listFoods(9999);
  if (existingFoods.length > 0) {
    console.log(`Database sudah berisi ${existingFoods.length} bahan. Hapus dulu jika ingin seed ulang.`);
    console.log(`  Untuk reset: DELETE FROM foods; di psql, lalu jalankan ulang script ini.`);
    return;
  }

  // Read CSV
  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const header = lines[0];
  const dataLines = lines.slice(1);

  console.log(`Membaca ${dataLines.length} baris dari CSV...`);

  let inserted = 0;
  let skipped = 0;

  for (const line of dataLines) {
    const parsed = parseCsvLine(line.replace(/\r$/, ""));
    if (!parsed) {
      skipped++;
      continue;
    }

    const category = guessCategory(parsed.name);

    try {
      await createFood({
        name: parsed.name,
        category: category,
        portion_grams: 100, // CSV data is per 100g
        protein: parsed.proteins,
        calories: parsed.calories,
        fat: parsed.fat,
        carbs: parsed.carbohydrate,
        price: 0, // Harga belum tersedia di dataset
      });
      inserted++;

      if (inserted % 100 === 0) {
        console.log(`  ... ${inserted} bahan berhasil dimasukkan`);
      }
    } catch (err) {
      console.error(`  ✗ Gagal insert "${parsed.name}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nSelesai.`);
  console.log(`  Berhasil: ${inserted} bahan`);
  console.log(`  Dilewati: ${skipped} baris`);
  console.log(`\nCatatan:`);
  console.log(`  - Semua porsi diset 100g (sesuai standar TKPI)`);
  console.log(`  - Harga diset Rp 0 (perlu diisi manual lewat dashboard)`);
  console.log(`  - Kategori dideteksi otomatis dari nama bahan`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error.message);
    process.exit(1);
  })
  .finally(() => closePool());
