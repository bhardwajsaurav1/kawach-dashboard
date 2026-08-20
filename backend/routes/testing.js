const express = require('express');
const Testing = require('../models/Testing');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all testing records
router.get('/', protect, async (req, res) => {
  try {
    const tests = await Testing.find({}).populate('tankId', 'registrationNumber tankModel');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new testing record (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const test = await Testing.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update testing record (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const test = await Testing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ message: 'Testing record not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE testing record (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const test = await Testing.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ message: 'Testing record not found' });
    res.json({ message: 'Testing record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
