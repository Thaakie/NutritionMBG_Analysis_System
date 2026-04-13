const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:5001";
const SUPPORTED_AGE_GROUPS = ["7-9", "10-12", "13-15", "16-18"];

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);
app.use(express.json());

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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
    }
  }

  return null;
}


//restApi
app.get("/", (req, res) => {
  res.json({ message: "NutriSafety API is running." });
});

app.get("/api/health", async (req, res) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
    res.json({
      status: "ok",
      api: "nutrisafety-backend",
      ai_engine: response.data,
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      api: "nutrisafety-backend",
      error: "AI engine is unavailable.",
    });
  }
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

    return res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(
        error.response.data || {
          error: "AI service rejected the request.",
        },
      );
    }

    console.error("AI service error:", error.message);
    return res.status(503).json({
      error: "Unable to reach AI optimization service.",
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NutriSafety backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
