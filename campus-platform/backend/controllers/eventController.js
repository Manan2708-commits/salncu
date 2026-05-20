const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Club = require('../models/Club');

// GET /api/events  — public
exports.getEvents = async (req, res) => {
  try {
    const { search = '', category = '', status = '', clubId = '', page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    if (clubId) query.clubId = clubId;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('clubId', 'name logo')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name logo banner');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events  — club_admin
exports.createEvent = async (req, res) => {
  try {
    const club = await Club.findOne({ adminId: req.user._id });
    if (!club) return res.status(403).json({ message: 'No club linked to your account' });

    const { title, description, date, time, venue, category, maxParticipants, registrationDeadline } = req.body;
    if (!title || !description || !date || !time || !venue)
      return res.status(400).json({ message: 'Required fields missing' });

    const event = await Event.create({
      title, description, date, time, venue, category,
      maxParticipants: maxParticipants || null,
      registrationDeadline: registrationDeadline || null,
      banner: req.file?.path || '',
      clubId: club._id,
      clubName: club.name,
      createdBy: req.user._id,
    });

    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/events/:id  — club_admin (own) or super_admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const club = await Club.findById(event.clubId);
    if (req.user.role !== 'super_admin' && club.adminId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    const fields = ['title', 'description', 'date', 'time', 'venue', 'category', 'maxParticipants', 'registrationDeadline', 'status'];
    fields.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
    if (req.file) event.banner = req.file.path;

    await event.save();
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const club = await Club.findById(event.clubId);
    if (req.user.role !== 'super_admin' && club.adminId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ message: 'Event is cancelled' });
    if (event.maxParticipants && event.participantCount >= event.maxParticipants)
      return res.status(400).json({ message: 'Event is full' });

    const reg = await EventRegistration.create({
      eventId: event._id,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
    });

    await Event.findByIdAndUpdate(event._id, { $inc: { participantCount: 1 } });
    res.status(201).json({ registration: reg });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already registered' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id/participants  — club_admin or super_admin
exports.getParticipants = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ eventId: req.params.id, status: 'confirmed' })
      .populate('userId', 'name email');
    res.json({ participants: regs, total: regs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
