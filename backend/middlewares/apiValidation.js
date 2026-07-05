const SUPPORTED_AGE_GROUPS = ["7-9", "10-12", "13-15", "16-18"];
const FOOD_FIELD_MAX = {
  portion_grams: 2000,
  protein: 200,
  calories: 2500,
  fat: 200,
  carbs: 400,
  price: 200000,
};

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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

function validateFoodBody(req, res, next) {
  const validationError = validateFoodPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  next();
}

function validateOptimizeBody(req, res, next) {
  const validationError = validateOptimizePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  next();
}

function validateFoodIdParam(req, res, next) {
  const foodId = Number(req.params.id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return res.status(400).json({ error: "Invalid food ID." });
  }

  req.foodId = foodId;
  next();
}

module.exports = {
  validateFoodBody,
  validateOptimizeBody,
  validateFoodIdParam,
};
