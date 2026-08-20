const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  fullName: { type: String },
  text: { type: String, required: true },
  icon: { type: String, default: 'history' },
  type: { type: String, enum: ['User', 'Admin', 'System'], default: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
