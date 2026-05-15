const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ExpenseController = require("../controllers/expenseController");

router.use(authMiddleware);

router.get("/", ExpenseController.getAll);
router.get("/:id", ExpenseController.getOne);
router.post("/", ExpenseController.create);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.remove);

module.exports = router;
