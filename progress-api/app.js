const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

function createApp(dbPath) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const db = new sqlite3.Database(dbPath || path.join(__dirname, 'data', 'progress.db'));

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_name TEXT NOT NULL,
        item_text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        progress_percentage REAL DEFAULT 0,
        cfi TEXT,
        UNIQUE(plan_name, item_text)
      )
    `);
  });

  app.get('/api/progress/:planName', (req, res) => {
    const { planName } = req.params;

    db.all(
      'SELECT item_text, completed, completed_at, progress_percentage, cfi FROM progress WHERE plan_name = ?',
      [planName],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  });

  app.post('/api/progress', (req, res) => {
    const { planName, itemText, completed, progressPercentage, cfi } = req.body;

    if (!planName || !itemText) {
      return res.status(400).json({ error: 'planName and itemText are required' });
    }

    const completedAt = completed ? new Date().toISOString() : null;
    const percentage = progressPercentage !== undefined ? progressPercentage : 0;

    db.run(
      `INSERT INTO progress (plan_name, item_text, completed, completed_at, progress_percentage, cfi)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(plan_name, item_text)
       DO UPDATE SET completed = ?, completed_at = ?, progress_percentage = ?, cfi = ?`,
      [planName, itemText, completed ? 1 : 0, completedAt, percentage, cfi || null,
       completed ? 1 : 0, completedAt, percentage, cfi || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.close = () => {
    return new Promise((resolve) => {
      db.close(() => {
        resolve();
      });
    });
  };

  return app;
}

module.exports = createApp;
