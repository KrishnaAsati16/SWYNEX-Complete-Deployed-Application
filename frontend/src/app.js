const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const launchRoutes = require('./routes/launchRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/launches', launchRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
