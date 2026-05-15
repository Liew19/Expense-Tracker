const db = require("../db");

const UserModel = {
  findByEmail(email) {
    return db.query("SELECT * FROM users WHERE email = ?", [email]);
  },

  create(username, email, hashedPassword) {
    return db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );
  },
};

module.exports = UserModel;
