const express = require('express');
const Workforce = require('../models/Workforce');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all workforce
router.get('/', protect, async (req, res) => {
  try {
    const workforce = await Workforce.find({}).populate('currentAssignment', 'registrationNumber tankModel');
    res.json(workforce);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new workforce personnel (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const workforce = await Workforce.create(req.body);
    res.status(201).json(workforce);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update workforce details/attendance (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const workforce = await Workforce.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workforce) return res.status(404).json({ message: 'Workforce personnel not found' });
    res.json(workforce);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE workforce personnel (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const workforce = await Workforce.findByIdAndDelete(req.params.id);
    if (!workforce) return res.status(404).json({ message: 'Workforce personnel not found' });
    res.json({ message: 'Workforce personnel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
