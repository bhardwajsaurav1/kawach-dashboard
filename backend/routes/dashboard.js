const express = require('express');
const Tank = require('../models/Tank');
const Personnel = require('../models/Personnel');
const Workforce = require('../models/Workforce');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalTanks = await Tank.countDocuments();
    const operationalTanks = await Tank.countDocuments({ operationalStatus: 'Active' });
    const maintenanceTanks = await Tank.countDocuments({ operationalStatus: { $in: ['Under Maintenance', 'Overhaul'] } });
    
    const totalPersonnel = await Personnel.countDocuments();
    const totalWorkforce = await Workforce.countDocuments();
    
    res.json({
      totalTanks,
      operationalTanks,
      maintenanceTanks,
      totalPersonnel,
      totalWorkforce,
      readiness: totalTanks > 0 ? Math.round((operationalTanks / totalTanks) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
