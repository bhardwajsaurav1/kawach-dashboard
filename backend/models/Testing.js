const mongoose = require('mongoose');

const testingSchema = new mongoose.Schema({
  tankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  tankNumber: { type: String, required: true },
  testingSchedule: { type: Date, required: true },
  testingStage: { type: String, required: true },
  testResult: { type: String, enum: ['Pass', 'Fail', 'In Progress'], default: 'In Progress' },
  assignedOfficer: { type: String, required: true },
  completionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Testing', testingSchema);
