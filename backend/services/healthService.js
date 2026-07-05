const { fetchDatabaseHealth } = require("../repositories/healthRepository");
const { fetchAiEngineHealth } = require("./aiEngineService");

async function getSystemHealthStatus() {
  const [aiEngineResult, databaseResult] = await Promise.allSettled([
    fetchAiEngineHealth(),
    fetchDatabaseHealth(),
  ]);

  return {
    status: aiEngineResult.status === "fulfilled" && databaseResult.status === "fulfilled" ? "ok" : "degraded",
    api: "nutrisafety-backend",
    ai_engine:
      aiEngineResult.status === "fulfilled"
        ? aiEngineResult.value
        : {
            status: "unavailable",
            error: "AI engine is unavailable.",
          },
    database:
      databaseResult.status === "fulfilled"
        ? databaseResult.value
        : {
            status: "unavailable",
            error: "PostgreSQL is unavailable.",
          },
  };
}

module.exports = {
  getSystemHealthStatus,
};
