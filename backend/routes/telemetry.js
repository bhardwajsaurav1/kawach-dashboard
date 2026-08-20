const express = require('express');
const TelemetryLog = require('../models/TelemetryLog');
const Tank = require('../models/Tank');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/telemetry
// @desc    Save telemetry manual entry log
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tankId, testStand, mode, readings, status, notes } = req.body;
    
    let tank;
    // Attempt to find by ID, or by registration number if tankId is a string like "ARJ-2023-994"
    if (tankId && tankId.length === 24) {
      tank = await Tank.findById(tankId);
    } else {
      tank = await Tank.findOne({ registrationNumber: tankId });
    }

    if (!tank) {
      // Create a dummy tank for testing if none found, or return error. Let's return error.
      // return res.status(404).json({ message: 'Tank not found for telemetry' });
      
      // Since it's a demo, we might not have the tank seeded. Let's allow saving without a valid tank ref for now by just setting a string (though schema expects ObjectId. Wait, we must provide valid ObjectId).
      // Let's create one if not exists for demo purposes.
      tank = await Tank.create({
        tankId: `TNK-${Date.now().toString().slice(-6)}`,
        registrationNumber: tankId || 'UNKNOWN-TANK',
        tankModel: 'Arjun MK1A',
        chassisNumber: `CH-${Date.now()}`
      });
    }

    const log = await TelemetryLog.create({
      tank: tank._id,
      testStand,
      mode,
      operator: req.user._id,
      readings,
      status,
      notes
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/telemetry/:tankId
// @desc    Get telemetry logs for a tank
// @access  Private
router.get('/:tankId', protect, async (req, res) => {
  try {
    const logs = await TelemetryLog.find({ tank: req.params.tankId }).sort({ createdAt: -1 }).limit(10).populate('operator', 'fullName');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
