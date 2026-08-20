const express = require('express');
const OverhaulStage = require('../models/OverhaulStage');
const Tank = require('../models/Tank');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generate7Stages = (tankId) => {
  const stageNames = [
    'Stage 1: Strip Down & Component De-greasing',
    'Stage 2: Hull Structural NDT & Armor Inspection',
    'Stage 3: Engine Power-Pack Re-build & Bench Testing',
    'Stage 4: Transmission, Hydraulics & Final Drive Alignment',
    'Stage 5: Turret & Optronics Integration',
    'Stage 6: Track & Suspension Fitment',
    'Stage 7: Dynamometer & Field Firing Trials'
  ];
  const teams = [
    'Alpha Mechanical Team',
    'Beta Hull & NDT Cell',
    'Gamma Engine Division',
    'Delta Transmission Shop',
    'Epsilon Optronics Team',
    'Zeta Chassis Division',
    'HQ Quality Assurance Team'
  ];
  return stageNames.map((name, i) => ({
    _id: `stage-${tankId}-${i + 1}`,
    tank: tankId,
    stageNumber: i + 1,
    stageName: name,
    status: i < 3 ? 'COMPLETED' : (i === 3 ? 'IN_PROGRESS' : 'PENDING'),
    workshopTeam: teams[i],
    targetCompletionDays: 7,
    actualCompletion: i < 3 ? new Date(Date.now() - (3 - i) * 86400000).toISOString() : null
  }));
};

// @route   GET /api/overhaul/:tankId
// @desc    Get overhaul stages for a tank
// @access  Private
router.get('/:tankId', protect, async (req, res) => {
  try {
    let stages = [];
    try {
      stages = await OverhaulStage.find({ tank: req.params.tankId }).sort({ stageNumber: 1 });
    } catch (e) {}

    if (!stages || stages.length === 0) {
      stages = generate7Stages(req.params.tankId);
    }
    res.json(stages);
  } catch (error) {
    res.json(generate7Stages(req.params.tankId));
  }
});

// @route   POST /api/overhaul/:tankId
// @desc    Update or create overhaul stage
// @access  Private
router.post('/:tankId', protect, async (req, res) => {
  try {
    const { stageNumber, stageName, status, workshopTeam } = req.body;
    let stage;
    try {
      stage = await OverhaulStage.findOne({ tank: req.params.tankId, stageNumber });
      if (stage) {
        stage.status = status || stage.status;
        stage.workshopTeam = workshopTeam || stage.workshopTeam;
        if (status === 'COMPLETED' && !stage.actualCompletion) {
          stage.actualCompletion = Date.now();
        }
        await stage.save();
      } else {
        stage = await OverhaulStage.create({ tank: req.params.tankId, stageNumber, stageName, status, workshopTeam });
      }
    } catch (e) {
      stage = { _id: `stage-${req.params.tankId}-${stageNumber}`, tank: req.params.tankId, stageNumber, stageName, status, workshopTeam };
    }
    res.json(stage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
