const db = require("../db");

const ExpenseModel = {
  findAllByUser(userId) {
    return db.query(
      "SELECT * FROM expenses WHERE user_id = ? AND is_deleted = 0 ORDER BY date DESC, created_at DESC",
      [userId],
    );
  },

  findById(id, userId) {
    return db.query(
      "SELECT * FROM expenses WHERE id = ? AND user_id = ? AND is_deleted = 0",
      [id, userId],
    );
  },

  create(userId, data) {
    const { title, amount, type, category, date, note } = data;
    return db.query(
      "INSERT INTO expenses (user_id, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, title, amount, type, category, date, note || null],
    );
  },

  findByIdRaw(id) {
    return db.query("SELECT * FROM expenses WHERE id = ?", [id]);
  },

  update(id, userId, data) {
    const { title, amount, type, category, date, note } = data;
    return db.query(
      "UPDATE expenses SET title = ?, amount = ?, type = ?, category = ?, date = ?, note = ? WHERE id = ? AND user_id = ?",
      [title, amount, type, category, date, note, id, userId],
    );
  },

  softDelete(id, userId) {
    return db.query(
      "UPDATE expenses SET is_deleted = 1 WHERE id = ? AND user_id = ?",
      [id, userId],
    );
  },
};

module.exports = ExpenseModel;
