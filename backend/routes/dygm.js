const express = require('express');
const DyGmBoard = require('../models/DyGmBoard');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultDyGmBoard = {
  _id: 'dygm-default-board',
  currentQuarterTarget: 18,
  tanksDeliveredCount: 12,
  overhaulQualityRating: 98.4,
  criticalPartsShortageCount: 3,
  workforceEfficiencyScore: 94.2,
  activeHangarCount: 6,
  notes: 'Quarterly overhaul target on track. Hangar 4 transmission calibration under final audit.'
};

// @route   GET /api/dygm
// @desc    Get DyGM board parameters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let board;
    try {
      board = await DyGmBoard.findOne({});
    } catch (e) {}

    if (!board) {
      board = defaultDyGmBoard;
    }
    res.json(board);
  } catch (error) {
    res.json(defaultDyGmBoard);
  }
});

// @route   PUT /api/dygm
// @desc    Update DyGM board parameters
// @access  Private (Admin)
router.put('/', protect, authorize('Admin'), async (req, res) => {
  try {
    let board;
    try {
      board = await DyGmBoard.findOne({});
      if (!board) {
        board = new DyGmBoard(req.body);
      } else {
        Object.assign(board, req.body);
      }
      await board.save();
    } catch (e) {
      board = { ...defaultDyGmBoard, ...req.body };
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
