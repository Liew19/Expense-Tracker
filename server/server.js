const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");
const seedRoutes = require("./routes/seed");

const app = express();

app.use(cors());
app.use(express.json());

// Don't let Vercel CDN cache API responses (they return 304)
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, must-revalidate");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/seed", seedRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Debug: check database tables
app.get("/api/db-check", async (req, res) => {
  try {
    const db = require("./db");
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);
    const info = {};
    for (const name of tableNames) {
      const [create] = await db.query(`SHOW CREATE TABLE ${name}`);
      info[name] = create[0]["Create Table"];
    }
    res.json({ connected: true, tables: tableNames, info });
  } catch (err) {
    res.json({ connected: false, error: err.message, code: err.code });
  }
});

// Local dev: listen. Vercel: export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
