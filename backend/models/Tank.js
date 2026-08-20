const mongoose = require('mongoose');

const serviceHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String },
  description: { type: String },
  technician: { type: String },
  cost: { type: Number },
}, { _id: false });

const tankSchema = new mongoose.Schema({
  tankId: { type: String, required: true, unique: true, trim: true },
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  tankModel: {
    type: String,
    enum: ['T-72', 'T-90', 'T-72 Ajeya', 'Arjun', 'Arjun MK1A', 'BMP-2 Sarath', 'Other'],
    required: true
  },
  manufacturer: { type: String },
  manufacturingYear: { type: Number },
  engineNumber: { type: String },
  chassisNumber: { type: String, required: true },
  unitAssignment: { type: String },
  currentLocation: { type: String },
  operationalStatus: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Overhaul', 'Reserved', 'Decommissioned'],
    default: 'Active'
  },
  lastServiceDate: { type: Date },
  nextScheduledService: { type: Date },
  engineHours: { type: Number, default: 0 },
  kilometersCovered: { type: Number, default: 0 },
  assignedCommander: { type: mongoose.Schema.Types.ObjectId, ref: 'Personnel' },
  crewMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personnel' }],
  weaponSystemDetails: { type: String },
  ammunitionCapacity: { type: Number },
  fuelCapacity: { type: Number },
  images: [{ name: String, path: String, uploadedAt: { type: Date, default: Date.now } }],
  documents: [{ name: String, path: String, uploadedAt: { type: Date, default: Date.now } }],
  maintenanceNotes: { type: String },
  serviceHistory: [serviceHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Tank', tankSchema);
