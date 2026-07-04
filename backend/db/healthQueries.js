const { pool } = require("./pool");

async function getDatabaseHealth() {
  const startedAt = Date.now();
  await pool.query("SELECT 1");

  return {
    status: "ok",
    latency_ms: Date.now() - startedAt,
    database: process.env.PGDATABASE || "nutrisafety",
  };
}

module.exports = {
  getDatabaseHealth,
};
