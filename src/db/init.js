/**
 * Database initialization script for Forms-Clone SOAP API
 * Creates the necessary database tables and adds a test admin user
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const dbPath = path.join(dataDir, 'forms.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  console.log('Creating database tables...');

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Forms table
  db.run(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      is_published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Questions table
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      required BOOLEAN DEFAULT FALSE,
      options TEXT,
      order_num INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE
    )
  `);

  // Responses table
  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      user_id INTEGER,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `);

  // Answers table
  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      value TEXT,
      FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables created successfully');

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';
  const adminName = 'Admin User';

  db.get('SELECT * FROM users WHERE email = ?', [adminEmail], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }

    if (!user) {
      // Hash the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(adminPassword, salt);

      // Insert admin user
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [adminEmail, hashedPassword, adminName, 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created successfully');
            console.log('- Email:', adminEmail);
            console.log('- Password:', adminPassword);
          }
        }
      );
    } else {
      console.log('Admin user already exists');
    }
  });
});

// Close database connection when done
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database initialization completed');
    }
  });
}, 1000); // Give time for async operations to complete
