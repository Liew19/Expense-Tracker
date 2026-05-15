const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const sslConfig = (() => {
  if (!process.env.DB_SSL || process.env.DB_SSL === "false") return undefined;
  if (process.env.DB_CA_PATH) {
    return { ca: fs.readFileSync(process.env.DB_CA_PATH) };
  }
  return { rejectUnauthorized: false, minVersion: "TLSv1.2" };
})();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "expense_tracker",
  port: parseInt(process.env.DB_PORT || "3306"),
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Auto-create tables on startup (local dev only, skip on Vercel)
async function initTables() {
  try {
    const connection = await pool.promise().getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100),
        date DATE NOT NULL,
        note TEXT,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    connection.release();
    console.log("✓ Database tables ready");
  } catch (err) {
    console.error("✗ Failed to create tables:", err.message);
  }
}

// Auto-create tables on startup (all environments)
initTables();

module.exports = pool.promise();
