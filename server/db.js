const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const sslConfig = (() => {
  if (!process.env.DB_SSL || process.env.DB_SSL === "false") return undefined;
  if (process.env.DB_CA_PATH) {
    return { ca: fs.readFileSync(process.env.DB_CA_PATH) };
  }
  // TiDB Cloud requires TLS 1.2+ with server cert verification
  return { rejectUnauthorized: true, minVersion: "TLSv1.2" };
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

module.exports = pool.promise();
