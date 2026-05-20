const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
