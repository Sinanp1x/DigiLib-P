const { initializeDatabase } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize database when server starts
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});