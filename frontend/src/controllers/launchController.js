const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const LAUNCH_COLUMNS = `id, name, rocket, agency,
  launch_site AS "launchSite", launch_date AS "launchDate", status, description`;

// API field name -> database column name
const COLUMN_MAP = {
  name: 'name',
  rocket: 'rocket',
  agency: 'agency',
  launchSite: 'launch_site',
  launchDate: 'launch_date',
  status: 'status',
  description: 'description',
};

const listLaunches = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT ${LAUNCH_COLUMNS} FROM launches ${where} ORDER BY launch_date ASC`,
    values
  );
  res.json(rows);
});

const getLaunch = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${LAUNCH_COLUMNS} FROM launches WHERE id = $1`,
    [req.params.id]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Launch not found' });
  }
  res.json(rows[0]);
});

const createLaunch = asyncHandler(async (req, res) => {
  const { name, rocket, agency, launchSite, launchDate, status, description } = req.body;
  const { rows } = await db.query(
    `INSERT INTO launches (name, rocket, agency, launch_site, launch_date, status, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${LAUNCH_COLUMNS}`,
    [name, rocket, agency, launchSite, launchDate, status, description]
  );
  res.status(201).json(rows[0]);
});

const updateLaunch = asyncHandler(async (req, res) => {
  // req.body only contains fields that passed validation, so the keys are safe to map.
  const fields = Object.keys(req.body);
  const sets = fields.map((key, i) => `${COLUMN_MAP[key]} = $${i + 1}`);
  const values = fields.map((key) => req.body[key]);
  values.push(req.params.id);

  const { rows } = await db.query(
    `UPDATE launches SET ${sets.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${LAUNCH_COLUMNS}`,
    values
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Launch not found' });
  }
  res.json(rows[0]);
});

const deleteLaunch = asyncHandler(async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM launches WHERE id = $1', [req.params.id]);
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Launch not found' });
  }
  res.status(204).send();
});

module.exports = { listLaunches, getLaunch, createLaunch, updateLaunch, deleteLaunch };
