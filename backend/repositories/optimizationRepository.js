const { listOptimizationHistory, saveOptimizationRun } = require("../db");

async function findOptimizationHistory(limit) {
  return listOptimizationHistory(limit);
}

async function createOptimizationRun(payload, result) {
  return saveOptimizationRun(payload, result);
}

module.exports = {
  findOptimizationHistory,
  createOptimizationRun,
};
