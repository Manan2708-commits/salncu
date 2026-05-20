const router = require('express').Router();
const { submitRequest, getRequests, reviewRequest } = require('../controllers/clubRequestController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', protect, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), submitRequest);
router.get('/', protect, getRequests);
router.patch('/:id/review', protect, authorize('super_admin'), reviewRequest);

module.exports = router;
