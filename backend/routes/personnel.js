const express = require('express');
const Personnel = require('../models/Personnel');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/personnel
// @desc    Get all personnel
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const personnel = await Personnel.find({}).populate('assignedTank', 'registrationNumber tankModel');
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/personnel
// @desc    Create new personnel record (Enlistment)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { armyId, fullName, rank, unit, branch, securityClearance, notes } = req.body;
    
    const personnelExists = await Personnel.findOne({ armyId });
    if (personnelExists) {
      return res.status(400).json({ message: 'Personnel with this Army ID already exists' });
    }

    const personnel = await Personnel.create({
      armyId,
      fullName,
      rank,
      unit,
      branch: branch || 'Armoured Corps',
      securityClearance,
      notes
    });

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
    const personnel = await Personnel.findById(req.params.id).populate('assignedTank');
    if (personnel) {
      res.json(personnel);
    } else {
      res.status(404).json({ message: 'Personnel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
