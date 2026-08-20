const express = require('express');
const mongoose = require('mongoose');
const Tank = require('../models/Tank');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const generateSampleTanks = () => {
  const models = ['T-72', 'T-90', 'T-72 Ajeya', 'Arjun', 'Arjun MK1A', 'BMP-2 Sarath'];
  const statuses = ['Active', 'Under Maintenance', 'Overhaul', 'Active', 'Active', 'Reserved'];
  const locations = ['Northern Command', 'Western Command', 'Eastern Command', 'Southern Command'];
  return Array.from({ length: 25 }, (_, i) => ({
    _id: `mock-tank-${i + 1}`,
    tankId: `TNK-${10001 + i}`,
    registrationNumber: `ARJ-2022-${101 + i}`,
    tankModel: models[i % models.length],
    manufacturer: 'Avadi HVF',
    manufacturingYear: 2012 + (i % 10),
    engineNumber: `ENG-${50001 + i}`,
    chassisNumber: `CH-${60001 + i}`,
    unitAssignment: `${10 + (i % 10)} ARMOURED REGT`,
    currentLocation: locations[i % locations.length],
    operationalStatus: statuses[i % statuses.length],
    engineHours: 150 + i * 20,
    kilometersCovered: 900 + i * 40,
    weaponSystemDetails: '120mm rifled gun, PKT 7.62mm machine gun',
    ammunitionCapacity: 39,
    fuelCapacity: 1610
  }));
};

// @route   GET /api/tanks
// @desc    Get all tanks
// @access  Private
router.get('/', protect, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(generateSampleTanks());
  }

  try {
    let tanks = await Tank.find({}).populate('assignedCommander', 'fullName rank');
    if (!tanks || tanks.length === 0) {
      tanks = generateSampleTanks();
    }
    res.json(tanks);
  } catch (error) {
    res.json(generateSampleTanks());
  }
});

// @route   POST /api/tanks
// @desc    Create new tank (Registration)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tankId, registrationNumber, tankModel, chassisNumber, unitAssignment } = req.body;
    let tank;
    if (mongoose.connection.readyState === 1) {
      tank = await Tank.create({
        tankId: tankId || `TNK-${Date.now().toString().slice(-6)}`,
        registrationNumber,
        tankModel,
        chassisNumber,
        unitAssignment,
        operationalStatus: 'Active'
      });
    } else {
      tank = {
        _id: `tank-${Date.now()}`,
        tankId: tankId || `TNK-${Date.now().toString().slice(-6)}`,
        registrationNumber,
        tankModel,
        chassisNumber,
        unitAssignment,
        operationalStatus: 'Active'
      };
    }
    res.status(201).json(tank);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/tanks/:id
router.get('/:id', protect, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const sample = generateSampleTanks();
    const tank = sample.find(t => t._id === req.params.id || t.tankId === req.params.id) || sample[0];
    return res.json(tank);
  }

  try {
    let tank = await Tank.findById(req.params.id);
    if (!tank) {
      const sample = generateSampleTanks();
      tank = sample.find(t => t._id === req.params.id || t.tankId === req.params.id) || sample[0];
    }
    res.json(tank);
  } catch (error) {
    res.json(generateSampleTanks()[0]);
  }
});

module.exports = router;
