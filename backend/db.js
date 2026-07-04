const { closePool } = require("./db/pool");
const { initializeDatabase } = require("./db/schema");
const { getDatabaseHealth } = require("./db/healthQueries");
const { saveOptimizationRun, listOptimizationHistory } = require("./db/optimizationQueries");
const { listFoods, createFood, updateFood, deleteFood } = require("./db/foodQueries");

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
