const db = require("../db");

// Build WHERE clause and params for filtering expenses
function buildFilterClause(userId, filters = {}) {
  const conditions = ["user_id = ?", "is_deleted = 0"];
  const values = [userId];

  if (filters.type && filters.type !== "all") {
    conditions.push("type = ?");
    values.push(filters.type);
  }
  if (filters.month && filters.month !== "all") {
    conditions.push("DATE_FORMAT(date, '%Y-%m') = ?");
    values.push(filters.month);
  }
  if (filters.date) {
    conditions.push("date = ?");
    values.push(filters.date);
  }

  return { clause: "WHERE " + conditions.join(" AND "), values };
}

const ExpenseModel = {
  // Returns paginated + filtered expenses + total count
  async findAllByUser(userId, filters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const offset = (page - 1) * limit;

    const { clause, values } = buildFilterClause(userId, filters);

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM expenses ${clause}`,
      values,
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT * FROM expenses ${clause} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return { rows, total };
  },

  // Summary for filtered results (all pages, not just current page)
  async getSummary(userId, filters = {}) {
    const { clause, values } = buildFilterClause(userId, filters);

    const [rows] = await db.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense
      FROM expenses ${clause}`,
      values,
    );

    return {
      totalIncome: Number(rows[0].totalIncome),
      totalExpense: Number(rows[0].totalExpense),
    };
  },

  // Distinct dates that have records (for calendar dots)
  async getDatesWithRecords(userId) {
    const [rows] = await db.query(
      "SELECT DISTINCT DATE(date) as d FROM expenses WHERE user_id = ? AND is_deleted = 0 ORDER BY d",
      [userId],
    );
    return rows.map((r) => {
      const d = new Date(r.d);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  },

  // Distinct months that have records (for month filter dropdown)
  async getAvailableMonths(userId) {
    const [rows] = await db.query(
      "SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') as m FROM expenses WHERE user_id = ? AND is_deleted = 0 ORDER BY m DESC",
      [userId],
    );
    return rows.map((r) => r.m);
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
