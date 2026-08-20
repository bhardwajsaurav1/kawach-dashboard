const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
  armyId: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  rank: {
    type: String,
    enum: ['General', 'Lieutenant General', 'Major General', 'Brigadier', 'Colonel',
      'Lieutenant Colonel', 'Major', 'Captain', 'Lieutenant', 'Subedar Major',
      'Subedar', 'Naib Subedar', 'Havildar', 'Naik', 'Lance Naik', 'Sepoy',
      'Maintenance Specialist', 'Other'],
    required: true
  },
  unit: { type: String, required: true },
  branch: { type: String, required: true },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  dateOfJoining: { type: Date },
  yearsOfService: { type: Number, default: 0 },
  securityClearance: { type: String, enum: ['L1: BASIC', 'L2: TACTICAL', 'L3: COMMAND'], default: 'L1: BASIC' },
  assignedTank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  currentStatus: { type: String, enum: ['Active', 'On Leave', 'Training', 'Retired'], default: 'Active' },
  photograph: { type: String },
  documents: [{ name: String, path: String, uploadedAt: Date }],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Personnel', personnelSchema);
