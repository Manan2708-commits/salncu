const ClubRequest = require('../models/ClubRequest');
const Club = require('../models/Club');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /api/club-requests  — any authenticated user
exports.submitRequest = async (req, res) => {
  try {
    const { clubName, description, category, motivation } = req.body;
    if (!clubName || !description || !category)
      return res.status(400).json({ message: 'clubName, description and category are required' });

    // Prevent duplicate pending requests
    const existing = await ClubRequest.findOne({ applicantId: req.user._id, status: 'pending' });
    if (existing)
      return res.status(400).json({ message: 'You already have a pending club request' });

    const request = await ClubRequest.create({
      clubName,
      description,
      category,
      motivation,
      logo: req.files?.logo?.[0]?.path || '',
      banner: req.files?.banner?.[0]?.path || '',
      applicantId: req.user._id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
    });

    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/club-requests  — super_admin: all; user: own
exports.getRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = req.user.role === 'super_admin'
      ? status ? { status } : {}
      : { applicantId: req.user._id };

    const total = await ClubRequest.countDocuments(query);
    const requests = await ClubRequest.find(query)
      .populate('applicantId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ requests, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/club-requests/:id/review  — super_admin only
exports.reviewRequest = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'status must be approved or rejected' });

    const request = await ClubRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already reviewed' });

    request.status = status;
    request.adminNotes = adminNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    if (status === 'approved') {
      // Create the club
      const club = await Club.create({
        name: request.clubName,
        description: request.description,
        category: request.category,
        logo: request.logo,
        banner: request.banner,
        adminId: request.applicantId,
      });

      // Promote user to club_admin and link club
      await User.findByIdAndUpdate(request.applicantId, {
        role: 'club_admin',
        clubId: club._id,
      });

      // Email notification
      await sendEmail(
        request.applicantEmail,
        '🎉 Your Club Request was Approved!',
        `<h2>Congratulations, ${request.applicantName}!</h2>
         <p>Your club <strong>${request.clubName}</strong> has been approved.</p>
         <p>You now have Club Admin access. Log in to manage your club.</p>`
      );
    } else {
      await sendEmail(
        request.applicantEmail,
        'Club Request Update',
        `<h2>Hi ${request.applicantName},</h2>
         <p>Your club request for <strong>${request.clubName}</strong> was not approved.</p>
         ${adminNotes ? `<p>Reason: ${adminNotes}</p>` : ''}
         <p>You may submit a new request after addressing the feedback.</p>`
      );
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
