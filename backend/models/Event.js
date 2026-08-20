const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  time: { type: String, required: true }, // Format HH:MM
  category: { type: String, enum: ['Schedule', 'Meeting', 'Maintenance', 'Training'], default: 'Schedule' },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
