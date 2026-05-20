const router = require('express').Router();
const { getUsers, updateRole, getAnalytics } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('super_admin'), getUsers);
router.get('/analytics', protect, authorize('super_admin'), getAnalytics);
router.patch('/:id/role', protect, authorize('super_admin'), updateRole);

module.exports = router;
