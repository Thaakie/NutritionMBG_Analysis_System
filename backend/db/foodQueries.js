const { pool } = require("./pool");

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
  const existing = await pool.query(
    `
      SELECT *
      FROM foods
      WHERE LOWER(BTRIM(name)) = LOWER(BTRIM($1))
      LIMIT 1
    `,
    [data.name],
  );
  if (existing.rows[0]) {
    return existing.rows[0];
  }

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

module.exports = {
  listFoods,
  createFood,
  updateFood,
  deleteFood,
};
