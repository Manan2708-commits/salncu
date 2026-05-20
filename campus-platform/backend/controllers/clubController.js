const Club = require('../models/Club');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');

// GET /api/clubs  — public, paginated, searchable
exports.getClubs = async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const total = await Club.countDocuments(query);
    const clubs = await Club.find(query)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ clubs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/clubs/:id
exports.getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('adminId', 'name email');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    const events = await Event.find({ clubId: club._id, status: { $ne: 'cancelled' } }).sort({ date: 1 });
    res.json({ club, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/clubs/:id  — club_admin or super_admin
exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Only the club's admin or super_admin can update
    if (req.user.role !== 'super_admin' && club.adminId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    const { name, description, category, socialLinks } = req.body;
    if (name) club.name = name;
    if (description) club.description = description;
    if (category) club.category = category;
    if (socialLinks) club.socialLinks = { ...club.socialLinks, ...socialLinks };

    // Handle image uploads
    if (req.files?.logo) club.logo = req.files.logo[0].path;
    if (req.files?.banner) club.banner = req.files.banner[0].path;

    await club.save();
    res.json({ club });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/clubs/:id  — super_admin only
exports.deleteClub = async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
