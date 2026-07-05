const { pool } = require("./pool");

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

  await pool.query(`
    DELETE FROM foods a
    USING foods b
    WHERE a.id > b.id
      AND LOWER(BTRIM(a.name)) = LOWER(BTRIM(b.name))
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS foods_unique_name_ci
    ON foods ((LOWER(BTRIM(name))))
  `);
}

module.exports = {
  initializeDatabase,
};
