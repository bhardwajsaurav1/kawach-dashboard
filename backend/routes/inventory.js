const express = require('express');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all inventory
router.get('/', protect, async (req, res) => {
  try {
    const items = await Inventory.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new inventory item (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update inventory item (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE inventory item (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
