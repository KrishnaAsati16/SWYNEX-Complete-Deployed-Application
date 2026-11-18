const router = require('express').Router();
const ctrl = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addWatchlistSchema, updateNoteSchema, idParamSchema } = require('../validators/schemas');

// Every watchlist route needs a logged-in user
router.use(authenticate);

router.get('/', ctrl.getWatchlist);
router.post('/', validate({ body: addWatchlistSchema }), ctrl.addToWatchlist);
router.patch('/:id', validate({ params: idParamSchema, body: updateNoteSchema }), ctrl.updateNote);
router.delete('/:id', validate({ params: idParamSchema }), ctrl.removeFromWatchlist);

module.exports = router;
