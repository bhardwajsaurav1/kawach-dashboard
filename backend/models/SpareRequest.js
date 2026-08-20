const mongoose = require('mongoose');

const spareRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: String, required: true },
  dept: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('SpareRequest', spareRequestSchema);
