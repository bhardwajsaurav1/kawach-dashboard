const express = require('express');
const OverhaulStage = require('../models/OverhaulStage');
const Tank = require('../models/Tank');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/overhaul/:tankId
// @desc    Get overhaul stages for a tank
// @access  Private
router.get('/:tankId', protect, async (req, res) => {
  try {
    const stages = await OverhaulStage.find({ tank: req.params.tankId }).sort({ stageNumber: 1 });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/overhaul/:tankId
// @desc    Update or create overhaul stage
// @access  Private
router.post('/:tankId', protect, async (req, res) => {
  try {
    const { stageNumber, stageName, status, workshopTeam } = req.body;
    
    let stage = await OverhaulStage.findOne({ tank: req.params.tankId, stageNumber });
    
    if (stage) {
      stage.status = status || stage.status;
      stage.workshopTeam = workshopTeam || stage.workshopTeam;
      if (status === 'COMPLETED' && !stage.actualCompletion) {
        stage.actualCompletion = Date.now();
      }
      await stage.save();
    } else {
      stage = await OverhaulStage.create({
        tank: req.params.tankId,
        stageNumber,
        stageName,
        status,
        workshopTeam
      });
    }

    // Update tank status if needed
    if (stageNumber === 7 && status === 'COMPLETED') {
      await Tank.findByIdAndUpdate(req.params.tankId, { operationalStatus: 'Active' });
    } else {
      await Tank.findByIdAndUpdate(req.params.tankId, { operationalStatus: 'Overhaul' });
    }

    res.json(stage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
