const mongoose = require('mongoose');

const telemetryLogSchema = new mongoose.Schema({
  tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank', required: true },
  testStand: { type: String },
  mode: { type: String },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readings: {
    engineTemperature: { type: Number },
    coolantTemperature: { type: Number },
    oilPressure: { type: Number },
    oilTemperature: { type: Number },
    engineRpm: { type: Number },
    fuelConsumptionRate: { type: Number },
    exhaustGasTemp: { type: Number },
    batteryVoltage: { type: Number }
  },
  status: { type: String, enum: ['NOMINAL', 'WARNING', 'CRITICAL'], default: 'NOMINAL' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TelemetryLog', telemetryLogSchema);
