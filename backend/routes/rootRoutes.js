const { Router } = require("express");
const { getRoot } = require("../controllers/rootController");

const router = Router();

router.get("/", getRoot);

module.exports = router;
