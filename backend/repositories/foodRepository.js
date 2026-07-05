const { createFood, deleteFood, listFoods, updateFood } = require("../db");

async function findFoods(limit) {
  return listFoods(limit);
}

async function createFoodRecord(food) {
  return createFood(food);
}

async function updateFoodRecord(id, food) {
  return updateFood(id, food);
}

async function deleteFoodRecord(id) {
  return deleteFood(id);
}

module.exports = {
  findFoods,
  createFoodRecord,
  updateFoodRecord,
  deleteFoodRecord,
};
