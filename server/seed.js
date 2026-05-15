const bcrypt = require("bcryptjs");
const db = require("./db");
require("dotenv").config();

async function seed() {
  try {
    // Create test user
    const hashedPassword = await bcrypt.hash("accordia123", 10);
    const [userResult] = await db.query(
      "INSERT IGNORE INTO users (username, email, password) VALUES (?, ?, ?)",
      ["testuser", "test@accordia.com", hashedPassword],
    );

    let userId;
    if (userResult.affectedRows === 1) {
      userId = userResult.insertId;
      console.log("✓ Test user created (test@accordia.com / accordia123)");
    } else {
      // User already exists, fetch their id
      const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
        "test@accordia.com",
      ]);
      userId = rows[0].id;
      console.log("✓ Test user already exists");
    }

    // Sample expenses
    const expenses = [
      {
        title: "Groceries",
        amount: 285.5,
        type: "expense",
        category: "Food",
        date: "2026-05-01",
        note: "Weekly grocery run at AEON",
      },
      {
        title: "Petrol",
        amount: 60.0,
        type: "expense",
        category: "Transport",
        date: "2026-05-03",
        note: null,
      },
      {
        title: "Monthly Salary",
        amount: 8000.0,
        type: "income",
        category: "Salary",
        date: "2026-05-01",
        note: "May salary",
      },
      {
        title: "Freelance Project",
        amount: 1500.0,
        type: "income",
        category: "Freelance",
        date: "2026-05-10",
        note: "Website redesign for client",
      },
      {
        title: "Dinner at Sakura",
        amount: 120.0,
        type: "expense",
        category: "Food",
        date: "2026-05-05",
        note: null,
      },
      {
        title: "Grab Rides",
        amount: 35.0,
        type: "expense",
        category: "Transport",
        date: "2026-05-07",
        note: "To and from KL Sentral",
      },
      {
        title: "Netflix Subscription",
        amount: 55.0,
        type: "expense",
        category: "Entertainment",
        date: "2026-05-02",
        note: "Monthly premium plan",
      },
      {
        title: "Clinic Visit",
        amount: 90.0,
        type: "expense",
        category: "Health",
        date: "2026-05-08",
        note: "General checkup",
      },
      {
        title: "Online Shopping",
        amount: 200.0,
        type: "expense",
        category: "Shopping",
        date: "2026-05-06",
        note: "Shopee order - desk lamp",
      },
      {
        title: "Part-time Tutoring",
        amount: 500.0,
        type: "income",
        category: "Freelance",
        date: "2026-05-12",
        note: "Math tutoring for May",
      },
    ];

    let count = 0;
    for (const exp of expenses) {
      await db.query(
        "INSERT INTO expenses (user_id, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          exp.title,
          exp.amount,
          exp.type,
          exp.category,
          exp.date,
          exp.note,
        ],
      );
      count++;
    }
    console.log(`✓ ${count} sample expenses added`);

    // Summary
    const totalIncome = expenses
      .filter((e) => e.type === "income")
      .reduce((s, e) => s + e.amount, 0);
    const totalExpense = expenses
      .filter((e) => e.type === "expense")
      .reduce((s, e) => s + e.amount, 0);
    console.log(`\nSummary:`);
    console.log(`  Income : RM ${totalIncome}`);
    console.log(`  Expense: RM ${totalExpense}`);
    console.log(`  Balance: RM ${totalIncome - totalExpense}`);
    console.log(`\nLogin: test@accordia.com / accordia123`);
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
