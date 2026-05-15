const ExpenseModel = require("../models/expenseModel");

const sampleData = [
  { title: "Groceries", amount: 285.5, type: "expense", category: "Food", date: "2026-05-01", note: "Weekly grocery run at AEON" },
  { title: "Petrol", amount: 60.0, type: "expense", category: "Transport", date: "2026-05-03", note: null },
  { title: "Monthly Salary", amount: 8000.0, type: "income", category: "Salary", date: "2026-05-01", note: "May salary" },
  { title: "Freelance Project", amount: 1500.0, type: "income", category: "Freelance", date: "2026-05-10", note: "Website redesign" },
  { title: "Dinner at Sakura", amount: 120.0, type: "expense", category: "Food", date: "2026-05-05", note: null },
  { title: "Grab Rides", amount: 35.0, type: "expense", category: "Transport", date: "2026-05-07", note: "KL Sentral" },
  { title: "Netflix Subscription", amount: 55.0, type: "expense", category: "Entertainment", date: "2026-05-02", note: null },
  { title: "Clinic Visit", amount: 90.0, type: "expense", category: "Health", date: "2026-05-08", note: "Checkup" },
  { title: "Online Shopping", amount: 200.0, type: "expense", category: "Shopping", date: "2026-05-06", note: "Desk lamp" },
  { title: "Part-time Tutoring", amount: 500.0, type: "income", category: "Freelance", date: "2026-05-12", note: "Math tutoring" },
  { title: "Electric Bill", amount: 180.0, type: "expense", category: "Others", date: "2026-05-14", note: null },
  { title: "Water Bill", amount: 45.0, type: "expense", category: "Others", date: "2026-05-14", note: null },
  { title: "Cinema", amount: 25.0, type: "expense", category: "Entertainment", date: "2026-05-09", note: null },
  { title: "Mamak Supper", amount: 18.0, type: "expense", category: "Food", date: "2026-05-11", note: "Roti canai" },
  { title: "Website Maintenance", amount: 800.0, type: "income", category: "Freelance", date: "2026-05-15", note: "Retainer" },
  { title: "Toll & Parking", amount: 42.0, type: "expense", category: "Transport", date: "2026-05-13", note: "SmartTAG" },
  { title: "Pharmacy", amount: 35.0, type: "expense", category: "Health", date: "2026-05-10", note: "Vitamins" },
  { title: "Streaming Music", amount: 15.0, type: "expense", category: "Entertainment", date: "2026-04-28", note: "Spotify" },
  { title: "Bonus", amount: 2000.0, type: "income", category: "Salary", date: "2026-04-15", note: "Q1 bonus" },
  { title: "Internet Bill", amount: 129.0, type: "expense", category: "Others", date: "2026-04-12", note: "Unifi" },
];

async function seed(req, res) {
  try {
    // Check if already seeded
    const [existing] = await ExpenseModel.findAllByUser(req.user.id);
    if (existing.length > 0) {
      return res.json({ message: "Already have data, no seed needed", count: existing.length });
    }

    let count = 0;
    for (const exp of sampleData) {
      await ExpenseModel.create(req.user.id, exp);
      count++;
    }

    res.json({ message: `Added ${count} sample records`, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Seed failed" });
  }
}

module.exports = { seed };
