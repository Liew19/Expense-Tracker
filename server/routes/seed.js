const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SeedController = require("../controllers/seedController");

router.post("/", authMiddleware, SeedController.seed);

module.exports = router;
