const { pool } = require("./pool");

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

module.exports = {
  saveOptimizationRun,
  listOptimizationHistory,
};
