require("dotenv").config();

const { closePool, getDatabaseHealth, initializeDatabase } = require("../db");

async function main() {
  try {
    await initializeDatabase();
    const health = await getDatabaseHealth();
    console.log("Database connected:", health);
  } finally {
    await closePool();
  }
}

main().catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});
