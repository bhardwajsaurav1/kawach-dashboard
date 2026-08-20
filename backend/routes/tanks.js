const express = require('express');
const Tank = require('../models/Tank');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tanks
// @desc    Get all tanks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tanks = await Tank.find({}).populate('assignedCommander', 'fullName rank');
    res.json(tanks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tanks
// @desc    Create new tank (Registration)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tankId, registrationNumber, tankModel, chassisNumber, unitAssignment } = req.body;
    
    const tankExists = await Tank.findOne({ $or: [{ tankId }, { registrationNumber }, { chassisNumber }] });
    if (tankExists) {
      return res.status(400).json({ message: 'Tank with this ID, Registration, or Chassis already exists' });
    }

    const tank = await Tank.create({
      tankId: tankId || `TNK-${Date.now().toString().slice(-6)}`,
      registrationNumber,
      tankModel,
      chassisNumber,
      unitAssignment,
      operationalStatus: 'Active'
    });

    res.status(201).json(tank);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/tanks/:id
// @desc    Get tank by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const tank = await Tank.findById(req.params.id).populate('assignedCommander crewMembers');
    if (tank) {
      res.json(tank);
    } else {
      res.status(404).json({ message: 'Tank not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/tanks/:id
// @desc    Update tank details (Admin only)
// @access  Private
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const tank = await Tank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tank) return res.status(404).json({ message: 'Tank not found' });
    res.json(tank);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/tanks/:id
// @desc    Delete tank (Admin only)
// @access  Private
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const tank = await Tank.findByIdAndDelete(req.params.id);
    if (!tank) return res.status(404).json({ message: 'Tank not found' });
    res.json({ message: 'Tank deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
