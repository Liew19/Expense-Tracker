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

// Local dev: listen. Vercel: export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
