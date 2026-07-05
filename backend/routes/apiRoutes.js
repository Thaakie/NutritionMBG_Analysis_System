const { Router } = require("express");
const {
  createFoodItem,
  deleteFoodItem,
  getAkgProfiles,
  getFoods,
  getHealth,
  getOptimizationHistory,
  optimizeMenu,
  updateFoodItem,
} = require("../controllers/apiController");
const {
  validateFoodBody,
  validateFoodIdParam,
  validateOptimizeBody,
} = require("../middlewares/apiValidation");

const router = Router();

router.get("/health", getHealth);
router.get("/akg-profiles", getAkgProfiles);
router.post("/optimize", validateOptimizeBody, optimizeMenu);
router.get("/optimization-history", getOptimizationHistory);
router.get("/foods", getFoods);
router.post("/foods", validateFoodBody, createFoodItem);
router.put("/foods/:id", validateFoodIdParam, validateFoodBody, updateFoodItem);
router.delete("/foods/:id", validateFoodIdParam, deleteFoodItem);

module.exports = router;
