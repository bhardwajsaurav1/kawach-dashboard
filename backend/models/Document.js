const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  desc: { type: String },
  size: { type: String },
  state: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

