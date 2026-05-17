require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const {
  createFood,
  deleteFood,
  getDatabaseHealth,
  initializeDatabase,
  listFoods,
  listOptimizationHistory,
  saveOptimizationRun,
  updateFood,
} = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:5001";
const SUPPORTED_AGE_GROUPS = ["7-9", "10-12", "13-15", "16-18"];
const FOOD_FIELD_MAX = {
  portion_grams: 2000,
  protein: 200,
  calories: 2500,
  fat: 200,
  carbs: 400,
  price: 200000,
};

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);
app.use(express.json());

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeLimit(value, fallback = 10) {
  const parsedLimit = Number.parseInt(value, 10);
  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return fallback;
  }

  return Math.min(parsedLimit, 2000);
}

function validateFoodPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object.";
  }

  if (typeof payload.name !== "string" || !payload.name.trim()) {
    return "name must be a non-empty string.";
  }

  if ("category" in payload && (typeof payload.category !== "string" || !payload.category.trim())) {
    return "category must be a non-empty string.";
  }

  const numericFields = ["portion_grams", "protein", "calories", "fat", "carbs", "price"];
  for (const field of numericFields) {
    if (!(field in payload)) {
      return `Missing required field: ${field}.`;
    }

    if (!isValidNumber(payload[field])) {
      return `${field} must be a non-negative number.`;
    }

    if (payload[field] > FOOD_FIELD_MAX[field]) {
      return `${field} is too large. Max allowed is ${FOOD_FIELD_MAX[field]}.`;
    }
  }

  return null;
}

function validateOptimizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object.";
  }

  const requiredFields = ["budget", "minimum_calories", "minimum_protein", "age_group", "foods"];
  for (const field of requiredFields) {
    if (!(field in payload)) {
      return `Missing required field: ${field}.`;
    }
  }

  const numericFields = ["budget", "minimum_calories", "minimum_protein"];
  for (const field of numericFields) {
    if (!isValidNumber(payload[field])) {
      return `${field} must be a non-negative number.`;
    }
  }

  if (!SUPPORTED_AGE_GROUPS.includes(payload.age_group)) {
    return "age_group is not supported.";
  }

  if (
    "student_count" in payload &&
    (!Number.isInteger(payload.student_count) || payload.student_count <= 0)
  ) {
    return "student_count must be a positive integer.";
  }

  if ("excluded_menus" in payload) {
    if (!Array.isArray(payload.excluded_menus)) {
      return "excluded_menus must be an array.";
    }

    const hasInvalidMenu = payload.excluded_menus.some(
      (menu) => !Array.isArray(menu) || menu.some((item) => typeof item !== "string" || !item.trim()),
    );
    if (hasInvalidMenu) {
      return "excluded_menus must contain arrays of non-empty strings.";
    }
  }

  if (!Array.isArray(payload.foods) || payload.foods.length === 0) {
    return "foods must be a non-empty array.";
  }

  for (const [index, food] of payload.foods.entries()) {
    if (!food || typeof food !== "object" || Array.isArray(food)) {
      return `Food at index ${index} must be an object.`;
    }

    const requiredFoodFields = ["name", "portion_grams", "protein", "calories", "fat", "carbs", "price"];
    for (const field of requiredFoodFields) {
      if (!(field in food)) {
        return `Food at index ${index} is missing field: ${field}.`;
      }
    }

    if (typeof food.name !== "string" || !food.name.trim()) {
      return `Food at index ${index} must have a non-empty name.`;
    }

    for (const field of ["portion_grams", "protein", "calories", "fat", "carbs", "price"]) {
      if (!isValidNumber(food[field])) {
        return `${field} for food at index ${index} must be a non-negative number.`;
      }

      if (food[field] > FOOD_FIELD_MAX[field]) {
        return `${field} for food at index ${index} is too large. Max allowed is ${FOOD_FIELD_MAX[field]}.`;
      }
    }
  }

  return null;
}

//restApi
app.get("/", (req, res) => {
  res.json({ message: "NutriSafety API is running." });
});

app.get("/api/health", async (req, res) => {
  const [aiEngineResult, databaseResult] = await Promise.allSettled([
    axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 }),
    getDatabaseHealth(),
  ]);

  const responseBody = {
    status: aiEngineResult.status === "fulfilled" && databaseResult.status === "fulfilled" ? "ok" : "degraded",
    api: "nutrisafety-backend",
    ai_engine:
      aiEngineResult.status === "fulfilled"
        ? aiEngineResult.value.data
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

  res.status(responseBody.status === "ok" ? 200 : 503).json(responseBody);
});

app.get("/api/akg-profiles", async (req, res) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/akg-profiles`, { timeout: 3000 });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: "Unable to fetch AKG profiles from AI service.",
    });
  }
});

app.post("/api/optimize", async (req, res) => {
  const validationError = validateOptimizePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const response = await axios.post(`${AI_ENGINE_URL}/optimize`, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    try {
      const savedRun = await saveOptimizationRun(req.body, response.data);

      return res.json({
        ...response.data,
        history_id: savedRun.id,
        saved_at: savedRun.created_at,
      });
    } catch (databaseError) {
      console.error("Database save error:", databaseError.message);
      return res.status(503).json({
        error: "Optimization result was generated, but PostgreSQL is unavailable.",
      });
    }
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(
        error.response.data || {
          error: "AI service rejected the request.",
        },
      );
    }

    console.error("Request processing error:", error.message);
    return res.status(503).json({
      error: "Unable to process optimization request.",
    });
  }
});

app.get("/api/optimization-history", async (req, res) => {
  try {
    const history = await listOptimizationHistory(normalizeLimit(req.query.limit));
    res.json({
      items: history,
    });
  } catch (error) {
    console.error("Database read error:", error.message);
    res.status(503).json({
      error: "Unable to load optimization history from PostgreSQL.",
    });
  }
});

// ── Food CRUD ───────────────────────────────────────────────────────────

app.get("/api/foods", async (req, res) => {
  try {
    const items = await listFoods(normalizeLimit(req.query.limit, 1500));
    res.json({ items });
  } catch (error) {
    console.error("Database read error:", error.message);
    res.status(503).json({ error: "Unable to load foods from PostgreSQL." });
  }
});

app.post("/api/foods", async (req, res) => {
  const validationError = validateFoodPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const food = await createFood(req.body);
    res.status(201).json(food);
  } catch (error) {
    console.error("Database write error:", error.message);
    res.status(503).json({ error: "Unable to save food to PostgreSQL." });
  }
});

app.put("/api/foods/:id", async (req, res) => {
  const foodId = Number(req.params.id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return res.status(400).json({ error: "Invalid food ID." });
  }

  const validationError = validateFoodPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const food = await updateFood(foodId, req.body);
    if (!food) {
      return res.status(404).json({ error: "Food not found." });
    }

    res.json(food);
  } catch (error) {
    console.error("Database update error:", error.message);
    res.status(503).json({ error: "Unable to update food in PostgreSQL." });
  }
});

app.delete("/api/foods/:id", async (req, res) => {
  const foodId = Number(req.params.id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return res.status(400).json({ error: "Invalid food ID." });
  }

  try {
    const deleted = await deleteFood(foodId);
    if (!deleted) {
      return res.status(404).json({ error: "Food not found." });
    }

    res.json({ message: "Food deleted." });
  } catch (error) {
    console.error("Database delete error:", error.message);
    res.status(503).json({ error: "Unable to delete food from PostgreSQL." });
  }
});

if (require.main === module) {
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
}

module.exports = app;
