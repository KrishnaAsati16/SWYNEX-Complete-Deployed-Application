const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getWatchlist = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT w.id, w.note, w.created_at AS "createdAt",
            json_build_object(
              'id', l.id,
              'name', l.name,
              'rocket', l.rocket,
              'agency', l.agency,
              'launchSite', l.launch_site,
              'launchDate', to_char(l.launch_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
              'status', l.status,
              'description', l.description
            ) AS launch
     FROM watchlist_items w
     JOIN launches l ON l.id = w.launch_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

const addToWatchlist = asyncHandler(async (req, res) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO watchlist_items (user_id, launch_id)
       VALUES ($1, $2)
       RETURNING id, launch_id AS "launchId", note, created_at AS "createdAt"`,
      [req.user.id, req.body.launchId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Launch is already in your watchlist' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Launch not found' });
    }
    throw err;
  }
});

const updateNote = asyncHandler(async (req, res) => {
  // user_id in the WHERE clause means a user can only edit their own items.
  const { rows } = await db.query(
    `UPDATE watchlist_items SET note = $1
     WHERE id = $2 AND user_id = $3
     RETURNING id, launch_id AS "launchId", note, created_at AS "createdAt"`,
    [req.body.note, req.params.id, req.user.id]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Watchlist item not found' });
  }
  res.json(rows[0]);
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { rowCount } = await db.query(
    'DELETE FROM watchlist_items WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Watchlist item not found' });
  }
  res.status(204).send();
});

module.exports = { getWatchlist, addToWatchlist, updateNote, removeFromWatchlist };