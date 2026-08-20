const mongoose = require('mongoose');

const overhaulStageSchema = new mongoose.Schema({
  tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank', required: true },
  stageNumber: { type: Number, required: true },
  stageName: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'IN-PROGRESS', 'COMPLETED', 'BLOCKED'], default: 'PENDING' },
  workshopTeam: { type: String }, // e.g., 'LOG_SEC_BRAVO'
  estCompletion: { type: Date },
  actualCompletion: { type: Date },
  notes: { type: String }
}, { timestamps: true });

// A tank can have multiple stages, but the combination of tank and stageNumber should probably be unique.
overhaulStageSchema.index({ tank: 1, stageNumber: 1 }, { unique: true });

module.exports = mongoose.model('OverhaulStage', overhaulStageSchema);
