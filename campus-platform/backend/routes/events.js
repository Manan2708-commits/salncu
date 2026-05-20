const router = require('express').Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, getParticipants } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('club_admin', 'super_admin'), upload.single('banner'), createEvent);
router.put('/:id', protect, authorize('club_admin', 'super_admin'), upload.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('club_admin', 'super_admin'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);
router.get('/:id/participants', protect, authorize('club_admin', 'super_admin'), getParticipants);

module.exports = router;
