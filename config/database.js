const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Database connection
async function getDbConnection() {
  return open({
    filename: path.join(__dirname, '../data/digilib.sqlite'),
    driver: sqlite3.Database
  });
}

// Initialize database with tables
async function initializeDatabase() {
  const db = await getDbConnection();
  
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      firebase_uid TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create other necessary tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL,
      status TEXT NOT NULL,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Add more tables as needed
  
  await db.close();
  console.log('Database initialized successfully');
}

module.exports = {
  getDbConnection,
  initializeDatabase
};
