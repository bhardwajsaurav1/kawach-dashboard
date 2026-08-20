const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  text: { type: String, required: true },
  unread: { type: Boolean, default: true },
  replies: [{
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
