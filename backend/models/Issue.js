const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  dept: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
