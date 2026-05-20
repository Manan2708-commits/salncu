const mongoose = require('mongoose');

const clubRequestSchema = new mongoose.Schema({
  clubName: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  motivation: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ClubRequest', clubRequestSchema);
