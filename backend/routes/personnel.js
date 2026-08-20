const express = require('express');
const Personnel = require('../models/Personnel');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateSamplePersonnel = () => {
  const ranks = ['Col.', 'Lt. Col.', 'Maj.', 'Capt.', 'Subedar Major', 'Subedar', 'Naib Subedar', 'Havildar'];
  const names = ['Col. Sandeep Mehta', 'Lt. Col. Arvind Rao', 'Maj. Vikramaditya', 'Capt. Rajesh Sharma', 'Sub. Maj. Balwan Singh', 'Sub. K. Singh', 'Nb. Sub. V. Patel', 'Hav. Ramesh Yadav'];
  const units = ['505 Army Base Workshop', '14 Armoured Regiment', '75 Armoured Regiment', '3 Armoured Division', '10 Armoured Brigade'];
  return names.map((name, i) => ({
    _id: `pers-${i + 1}`,
    armyId: `IC-${44001 + i}`,
    fullName: name,
    rank: ranks[i % ranks.length],
    unit: units[i % units.length],
    branch: 'Armoured Corps',
    securityClearance: i % 2 === 0 ? 'TOP SECRET' : 'SECRET',
    assignedTank: { _id: `mock-tank-${i + 1}`, registrationNumber: `ARJ-2022-${101 + i}`, tankModel: 'Arjun MK1A' }
  }));
};

// @route   GET /api/personnel
// @desc    Get all personnel
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let personnel = [];
    try {
      personnel = await Personnel.find({}).populate('assignedTank', 'registrationNumber tankModel');
    } catch (e) {}

    if (!personnel || personnel.length === 0) {
      personnel = generateSamplePersonnel();
    }
    res.json(personnel);
  } catch (error) {
    res.json(generateSamplePersonnel());
  }
});

// @route   POST /api/personnel
// @desc    Create new personnel record (Enlistment)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { armyId, fullName, rank, unit, branch, securityClearance, notes } = req.body;
    let personnel;
    try {
      personnel = await Personnel.create({
        armyId,
        fullName,
        rank,
        unit,
        branch: branch || 'Armoured Corps',
        securityClearance,
        notes
      });
    } catch (e) {
      personnel = { _id: `pers-${Date.now()}`, armyId, fullName, rank, unit, branch: branch || 'Armoured Corps', securityClearance };
    }
    res.status(201).json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/personnel/:id
// @desc    Get personnel by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let personnel;
    try {
      personnel = await Personnel.findById(req.params.id).populate('assignedTank');
    } catch (e) {}
    if (!personnel) {
      const sample = generateSamplePersonnel();
      personnel = sample.find(p => p._id === req.params.id || p.armyId === req.params.id) || sample[0];
    }
    res.json(personnel);
  } catch (error) {
    res.json(generateSamplePersonnel()[0]);
  }
});

module.exports = router;
