const router = require('express').Router();
const ctrl = require('../controllers/launchController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createLaunchSchema,
  updateLaunchSchema,
  launchQuerySchema,
  idParamSchema,
} = require('../validators/schemas');

// Public
router.get('/', validate({ query: launchQuerySchema }), ctrl.listLaunches);
router.get('/:id', validate({ params: idParamSchema }), ctrl.getLaunch);

// Admin only
router.post('/', authenticate, requireAdmin, validate({ body: createLaunchSchema }), ctrl.createLaunch);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate({ params: idParamSchema, body: updateLaunchSchema }),
  ctrl.updateLaunch
);
router.delete('/:id', authenticate, requireAdmin, validate({ params: idParamSchema }), ctrl.deleteLaunch);

module.exports = router;
