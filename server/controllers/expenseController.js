const ExpenseModel = require("../models/expenseModel");

const ExpenseController = {
  async getAll(req, res) {
    try {
      const [rows] = await ExpenseModel.findAllByUser(req.user.id);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getOne(req, res) {
    try {
      const [rows] = await ExpenseModel.findById(req.params.id, req.user.id);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async create(req, res) {
    try {
      const { title, amount, type, category, date, note } = req.body;

      if (!title || !amount || !type || !date) {
        return res
          .status(400)
          .json({ message: "Title, amount, type, and date are required" });
      }

      const [result] = await ExpenseModel.create(req.user.id, req.body);

      const [newExpense] = await ExpenseModel.findByIdRaw(result.insertId);
      res.status(201).json(newExpense[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async update(req, res) {
    try {
      const [existing] = await ExpenseModel.findById(
        req.params.id,
        req.user.id,
      );
      if (existing.length === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }

      const data = {
        title: req.body.title ?? existing[0].title,
        amount: req.body.amount ?? existing[0].amount,
        type: req.body.type ?? existing[0].type,
        category: req.body.category ?? existing[0].category,
        date: req.body.date ?? existing[0].date,
        note: req.body.note ?? existing[0].note,
      };

      await ExpenseModel.update(req.params.id, req.user.id, data);

      const [updated] = await ExpenseModel.findByIdRaw(req.params.id);
      res.json(updated[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async remove(req, res) {
    try {
      const [existing] = await ExpenseModel.findById(
        req.params.id,
        req.user.id,
      );
      if (existing.length === 0) {
        return res
          .status(404)
          .json({ message: "Expense not found or already deleted" });
      }

      await ExpenseModel.softDelete(req.params.id, req.user.id);
      res.json({ message: "Expense moved to trash successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = ExpenseController;
