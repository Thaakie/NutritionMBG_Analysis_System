const axios = require("axios");

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:5001";

async function fetchAiEngineHealth() {
  const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
  return response.data;
}

async function fetchAkgProfilesFromAi() {
  const response = await axios.get(`${AI_ENGINE_URL}/akg-profiles`, { timeout: 3000 });
  return response.data;
}

async function requestMenuOptimization(payload) {
  const response = await axios.post(`${AI_ENGINE_URL}/optimize`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  return response.data;
}

module.exports = {
  fetchAiEngineHealth,
  fetchAkgProfilesFromAi,
  requestMenuOptimization,
};
