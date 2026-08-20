const express = require('express');
const DyGmBoard = require('../models/DyGmBoard');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dygm
// @desc    Get DyGM board parameters (creates default if none exists)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let board = await DyGmBoard.findOne({});
    if (!board) {
      board = await DyGmBoard.create({});
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/dygm
// @desc    Update DyGM board parameters
// @access  Private (Admin)
router.put('/', protect, authorize('Admin'), async (req, res) => {
  try {
    let board = await DyGmBoard.findOne({});
    if (!board) {
      board = new DyGmBoard(req.body);
    } else {
      Object.assign(board, req.body);
    }
    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
