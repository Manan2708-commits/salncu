const router = require('express').Router();
const { getClubs, getClub, updateClub, deleteClub } = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getClubs);
router.get('/:id', getClub);
router.put('/:id', protect, authorize('club_admin', 'super_admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateClub);
router.delete('/:id', protect, authorize('super_admin'), deleteClub);

module.exports = router;
