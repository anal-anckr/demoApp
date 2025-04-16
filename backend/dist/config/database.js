"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Get the database path from environment variables
const dbPath = process.env.DATABASE_PATH || "./database.sqlite";
// Use verbose mode for more detailed error messages during development
const sqlite = sqlite3_1.default.verbose();
// Create a database connection
const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    }
    else {
        console.log("Connected to the SQLite database.");
        // Create tables if they don't exist
        createTables();
    }
});
// Function to initialize tables
function createTables() {
    // Create users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create tasks table
    db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
}
exports.default = db;
//# sourceMappingURL=database.js.map