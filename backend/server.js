require("dotenv").config();

const app = require("./app");
const { initializeDatabase } = require("./db");

const PORT = Number(process.env.PORT || 3000);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`NutriSafety backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize PostgreSQL:", error.message);
    process.exit(1);
  });
