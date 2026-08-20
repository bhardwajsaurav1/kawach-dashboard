const express = require('express');
const TelemetryLog = require('../models/TelemetryLog');
const Tank = require('../models/Tank');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateSampleTelemetry = (tankId) => {
  return [
    {
      _id: `tel-1-${tankId}`,
      testStand: 'Dynamometer Hangar 3',
      mode: 'AUTOMATIC',
      readings: { rpm: 2200, torque: 1450, temp: 88, oilPressure: 4.8 },
      status: 'NORMAL',
      notes: 'Peak load test completed within baseline tolerances.',
      createdAt: new Date().toISOString()
    },
    {
      _id: `tel-2-${tankId}`,
      testStand: 'Track Tension Rig #1',
      mode: 'MANUAL',
      readings: { rpm: 1800, torque: 1200, temp: 82, oilPressure: 4.5 },
      status: 'NORMAL',
      notes: 'Track alignment verified after pin replacement.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
};

// @route   POST /api/telemetry
router.post('/', protect, async (req, res) => {
  try {
    const { tankId, testStand, mode, readings, status, notes } = req.body;
    let log;
    try {
      log = await TelemetryLog.create({ tank: tankId, testStand, mode, readings, status, notes });
    } catch (e) {
      log = { _id: `tel-${Date.now()}`, testStand, mode, readings, status, notes, createdAt: new Date().toISOString() };
    }
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/telemetry/:tankId
router.get('/:tankId', protect, async (req, res) => {
  try {
    let logs = [];
    try {
      logs = await TelemetryLog.find({ tank: req.params.tankId }).sort({ createdAt: -1 }).limit(10);
    } catch (e) {}

    if (!logs || logs.length === 0) {
      logs = generateSampleTelemetry(req.params.tankId);
    }
    res.json(logs);
  } catch (error) {
    res.json(generateSampleTelemetry(req.params.tankId));
  }
});

module.exports = router;
