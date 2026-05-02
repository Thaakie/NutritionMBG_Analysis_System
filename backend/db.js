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

const pool = new Pool(buildPoolConfig());

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS optimization_history (
      id BIGSERIAL PRIMARY KEY,
      age_group VARCHAR(10) NOT NULL,
      budget NUMERIC(12, 2) NOT NULL,
      minimum_calories NUMERIC(12, 2) NOT NULL,
      minimum_protein NUMERIC(12, 2) NOT NULL,
      student_count INTEGER NOT NULL DEFAULT 1,
      recommended_menu TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_calories NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_protein NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_fat NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_carbs NUMERIC(12, 2) NOT NULL DEFAULT 0,
      request_payload JSONB NOT NULL,
      result_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS foods (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'Lainnya',
      portion_grams NUMERIC(10, 2) NOT NULL DEFAULT 0,
      protein NUMERIC(10, 2) NOT NULL DEFAULT 0,
      calories NUMERIC(10, 2) NOT NULL DEFAULT 0,
      fat NUMERIC(10, 2) NOT NULL DEFAULT 0,
      carbs NUMERIC(10, 2) NOT NULL DEFAULT 0,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getDatabaseHealth() {
  const startedAt = Date.now();
  await pool.query("SELECT 1");

  return {
    status: "ok",
    latency_ms: Date.now() - startedAt,
    database: process.env.PGDATABASE || "nutrisafety",
  };
}

async function saveOptimizationRun(payload, result) {
  const recommendedMenu = Array.isArray(result.recommended_menu) ? result.recommended_menu : [];

  const query = `
    INSERT INTO optimization_history (
      age_group,
      budget,
      minimum_calories,
      minimum_protein,
      student_count,
      recommended_menu,
      total_cost,
      total_calories,
      total_protein,
      total_fat,
      total_carbs,
      request_payload,
      result_payload
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb
    )
    RETURNING id, created_at
  `;

  const values = [
    payload.age_group,
    payload.budget,
    payload.minimum_calories,
    payload.minimum_protein,
    Number(payload.student_count ?? 1),
    recommendedMenu,
    result.total_cost || 0,
    result.total_calories || 0,
    result.total_protein || 0,
    result.total_fat || 0,
    result.total_carbs || 0,
    JSON.stringify(payload),
    JSON.stringify(result),
  ];

  const response = await pool.query(query, values);
  return response.rows[0];
}

async function listOptimizationHistory(limit = 10) {
  const response = await pool.query(
    `
      SELECT
        id,
        age_group,
        budget,
        minimum_calories,
        minimum_protein,
        student_count,
        recommended_menu,
        total_cost,
        total_calories,
        total_protein,
        total_fat,
        total_carbs,
        request_payload,
        result_payload,
        created_at
      FROM optimization_history
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit],
  );

  return response.rows;
}

async function listFoods(limit = 1500) {
  const response = await pool.query(
    `
      SELECT id, name, category, portion_grams, protein, calories, fat, carbs, price, created_at, updated_at
      FROM foods
      ORDER BY name ASC
      LIMIT $1
    `,
    [limit],
  );

  return response.rows;
}

async function createFood(data) {
  const query = `
    INSERT INTO foods (name, category, portion_grams, protein, calories, fat, carbs, price)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    data.name,
    data.category || "Lainnya",
    data.portion_grams,
    data.protein,
    data.calories,
    data.fat,
    data.carbs,
    data.price,
  ];

  const response = await pool.query(query, values);
  return response.rows[0];
}

async function updateFood(id, data) {
  const query = `
    UPDATE foods
    SET name = $1, category = $2, portion_grams = $3, protein = $4, calories = $5, fat = $6, carbs = $7, price = $8, updated_at = NOW()
    WHERE id = $9
    RETURNING *
  `;

  const values = [
    data.name,
    data.category || "Lainnya",
    data.portion_grams,
    data.protein,
    data.calories,
    data.fat,
    data.carbs,
    data.price,
    id,
  ];

  const response = await pool.query(query, values);
  return response.rows[0] || null;
}

async function deleteFood(id) {
  const response = await pool.query("DELETE FROM foods WHERE id = $1 RETURNING id", [id]);
  return response.rowCount > 0;
}

async function closePool() {
  await pool.end();
}

module.exports = {
  closePool,
  createFood,
  deleteFood,
  getDatabaseHealth,
  initializeDatabase,
  listFoods,
  listOptimizationHistory,
  saveOptimizationRun,
  updateFood,
};
