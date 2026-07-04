function getRoot(req, res) {
  res.json({ message: "NutriSafety API is running." });
}

module.exports = {
  getRoot,
};
