const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  banner: { type: String, default: '' },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  clubName: { type: String, required: true },
  category: { type: String, default: 'general' },
  maxParticipants: { type: Number, default: null },
  participantCount: { type: Number, default: 0 },
  registrationDeadline: { type: Date, default: null },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
