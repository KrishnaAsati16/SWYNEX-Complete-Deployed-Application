require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../sql/schema.sql'), 'utf8');
    await db.query(sql);
    console.log('Tables are ready.');
  } catch (err) {
    console.error('Could not create tables:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
