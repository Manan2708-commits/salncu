const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const ClubRequest = require('../models/ClubRequest');

// GET /api/users  — super_admin
exports.getUsers = async (req, res) => {
  try {
    const { search = '', role = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/role  — super_admin
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'club_admin', 'super_admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/analytics  — super_admin
exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalClubs, totalEvents, pendingRequests] = await Promise.all([
      User.countDocuments(),
      Club.countDocuments({ isActive: true }),
      Event.countDocuments(),
      ClubRequest.countDocuments({ status: 'pending' }),
    ]);
    res.json({ totalUsers, totalClubs, totalEvents, pendingRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
