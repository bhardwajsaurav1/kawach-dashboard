const mongoose = require('mongoose');

const assignmentHistorySchema = new mongoose.Schema({
  dateAssigned: { type: Date, default: Date.now },
  dateUnassigned: { type: Date },
  tankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  taskDescription: { type: String },
  remarks: { type: String }
}, { _id: false });

const workforceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  trade: { type: String },
  skillLevel: { type: String, enum: ['Trainee', 'Junior', 'Senior', 'Master', 'Expert'] },
  experience: { type: Number, default: 0 }, // in years
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotational'] },
  supervisor: { type: String },
  contactNumber: { type: String },
  email: { type: String },
  assignedWorkshop: { type: String },
  currentAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' }, // Can be null if available
  availability: { type: String, enum: ['Available', 'Assigned', 'On Leave', 'In Training'], default: 'Available' },
  certifications: [{ type: String }],
  joiningDate: { type: Date },
  attendanceStatus: { type: String, enum: ['Present', 'Absent', 'On Leave'], default: 'Present' },
  designation: { type: String },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  totalWorkingHours: { type: Number },
  remarks: { type: String },
  assignmentHistory: [assignmentHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Workforce', workforceSchema);
