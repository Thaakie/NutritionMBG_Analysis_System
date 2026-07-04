const { getDatabaseHealth } = require("../db");

async function fetchDatabaseHealth() {
  return getDatabaseHealth();
}

module.exports = {
  fetchDatabaseHealth,
};
