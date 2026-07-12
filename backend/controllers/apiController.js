const {
  createFoodRecord,
  deleteFoodRecord,
  findFoods,
  updateFoodRecord,
} = require("../repositories/foodRepository");
const {
  createOptimizationRun,
  findOptimizationHistory,
} = require("../repositories/optimizationRepository");
const { fetchAkgProfilesFromAi, requestMenuOptimization } = require("../services/aiEngineService");
const { getSystemHealthStatus } = require("../services/healthService");

function toNumber(value) {
  if (value === "" || value === undefined || value === null) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickValue(source, keys, fallback = undefined) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }

  return fallback;
}

function normalizeFoodRecord(food) {
  const source = food || {};

  return {
    name: String(pickValue(source, ["name"], "")).trim(),
    category: String(pickValue(source, ["category"], "Lainnya") || "Lainnya").trim() || "Lainnya",
    portion_grams: toNumber(pickValue(source, ["portion_grams", "portionGrams"])),
    protein: toNumber(pickValue(source, ["protein", "proteins"])),
    calories: toNumber(pickValue(source, ["calories", "energy"])),
    fat: toNumber(pickValue(source, ["fat"])),
    carbs: toNumber(pickValue(source, ["carbs", "carbohydrate"])),
    price: toNumber(pickValue(source, ["price"])),
  };
}

function normalizeOptimizationPayload(payload) {
  const source = payload || {};

  return {
    ...source,
    budget: toNumber(source.budget),
    minimum_calories: toNumber(source.minimum_calories),
    minimum_protein: toNumber(source.minimum_protein),
    student_count: source.student_count == null ? source.student_count : Number(source.student_count),
    foods: Array.isArray(source.foods) ? source.foods.map(normalizeFoodRecord) : [],
  };
}

function normalizeLimit(value, fallback = 10) {
  const parsedLimit = Number.parseInt(value, 10);
  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return fallback;
  }

  return Math.min(parsedLimit, 2000);
}

async function getHealth(req, res) {
  const responseBody = await getSystemHealthStatus();
  res.status(responseBody.status === "ok" ? 200 : 503).json(responseBody);
}

async function getAkgProfiles(req, res) {
  try {
    const response = await fetchAkgProfilesFromAi();
    res.json(response);
  } catch (error) {
    res.status(503).json({
      error: "Unable to fetch AKG profiles from AI service.",
    });
  }
}

async function optimizeMenu(req, res) {
  try {
    const normalizedPayload = normalizeOptimizationPayload(req.body);
    const optimizationResult = await requestMenuOptimization(normalizedPayload);

    try {
      const savedRun = await createOptimizationRun(normalizedPayload, optimizationResult);

      return res.json({
        ...optimizationResult,
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
}

async function getOptimizationHistory(req, res) {
  try {
    const history = await findOptimizationHistory(normalizeLimit(req.query.limit));
    res.json({
      items: history,
    });
  } catch (error) {
    console.error("Database read error:", error.message);
    res.status(503).json({
      error: "Unable to load optimization history from PostgreSQL.",
    });
  }
}

async function getFoods(req, res) {
  try {
    const items = await findFoods(normalizeLimit(req.query.limit, 1500));
    res.json({ items });
  } catch (error) {
    console.error("Database read error:", error.message);
    res.status(503).json({ error: "Unable to load foods from PostgreSQL." });
  }
}

async function createFoodItem(req, res) {
  try {
    const food = await createFoodRecord(normalizeFoodRecord(req.body));
    res.status(201).json(food);
  } catch (error) {
    console.error("Database write error:", error.message);
    res.status(503).json({ error: "Unable to save food to PostgreSQL." });
  }
}

async function updateFoodItem(req, res) {
  try {
    const food = await updateFoodRecord(req.foodId, normalizeFoodRecord(req.body));
    if (!food) {
      return res.status(404).json({ error: "Food not found." });
    }

    res.json(food);
  } catch (error) {
    console.error("Database update error:", error.message);
    res.status(503).json({ error: "Unable to update food in PostgreSQL." });
  }
}

async function deleteFoodItem(req, res) {
  try {
    const deleted = await deleteFoodRecord(req.foodId);
    if (!deleted) {
      return res.status(404).json({ error: "Food not found." });
    }

    res.json({ message: "Food deleted." });
  } catch (error) {
    console.error("Database delete error:", error.message);
    res.status(503).json({ error: "Unable to delete food from PostgreSQL." });
  }
}

module.exports = {
  getHealth,
  getAkgProfiles,
  optimizeMenu,
  getOptimizationHistory,
  getFoods,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
