require("dotenv").config();

const { closePool, initializeDatabase } = require("../db");
const { Pool } = require("pg");

function buildPoolConfig() {
  const sslMode = process.env.PGSSLMODE;
  const shouldUseSsl = sslMode === "require";

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl
        ? {
            rejectUnauthorized: false,
          }
        : false,
    };
  }

  return {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
}

// Estimasi harga per 100g (IDR) agar optimizer biaya lebih realistis daripada Rp 0.
const CATEGORY_PRICE_MAP = {
  "Makanan Pokok": 2200,
  "Lauk Hewani": 8000,
  "Lauk Nabati": 3500,
  "Lauk Pauk": 5500,
  "Sayuran": 1800,
  "Buah-buahan": 2500,
  "Susu & Produk Susu": 5000,
  "Jajanan & Kue": 3000,
  "Minuman": 2200,
  "Minyak & Lemak": 4500,
  "Bumbu & Rempah": 2800,
  Lainnya: 3000,
};

const GLOBAL_FALLBACK_PRICE = 3000;

async function run() {
  await initializeDatabase();
  const pool = new Pool(buildPoolConfig());

  try {
    const summary = [];

    for (const [category, price] of Object.entries(CATEGORY_PRICE_MAP)) {
      const result = await pool.query(
        `
        UPDATE foods
        SET price = $1, updated_at = NOW()
        WHERE price = 0 AND category = $2
      `,
        [price, category],
      );

      if (result.rowCount > 0) {
        summary.push({ category, price, updated: result.rowCount });
      }
    }

    const fallbackResult = await pool.query(
      `
      UPDATE foods
      SET price = $1, updated_at = NOW()
      WHERE price = 0
    `,
      [GLOBAL_FALLBACK_PRICE],
    );

    const totalUpdated =
      summary.reduce((sum, item) => sum + item.updated, 0) + fallbackResult.rowCount;

    console.log("Seed harga selesai.");
    console.log(`Total data terupdate: ${totalUpdated}`);
    console.log("");
    console.log("Rincian per kategori:");
    for (const item of summary) {
      console.log(
        `- ${item.category}: ${item.updated} data -> Rp ${item.price.toLocaleString("id-ID")}`,
      );
    }
    if (fallbackResult.rowCount > 0) {
      console.log(
        `- Fallback kategori lain: ${fallbackResult.rowCount} data -> Rp ${GLOBAL_FALLBACK_PRICE.toLocaleString("id-ID")}`,
      );
    }
  } finally {
    await pool.end();
  }
}

run()
  .catch((error) => {
    console.error("Seed harga gagal:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await closePool();
  });
