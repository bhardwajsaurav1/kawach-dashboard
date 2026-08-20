const express = require('express');
const router = express.Router();

// Mock store for persistent engine telemetry runs and fault logs
let telemetryLogs = [
  { id: 'LOG-101', engineId: 'V-92S2-ENG-904', healthScore: 92, predictedFault: 'Minor Turbocharger Turbine Thermal Stress', timestamp: new Date().toISOString() }
];

// GET telemetry logs
router.get('/logs', (req, res) => {
  res.json({ success: true, count: telemetryLogs.length, logs: telemetryLogs });
});

// POST save diagnostic log
router.post('/logs', (req, res) => {
  const { engineId, healthScore, predictedFault, faultSeverity, rulHours } = req.body;
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    engineId: engineId || 'V-92S2-ENG-904',
    healthScore,
    predictedFault,
    faultSeverity,
    rulHours,
    timestamp: new Date().toISOString()
  };
  telemetryLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

// GET engine health status overview
router.get('/health-summary', (req, res) => {
  res.json({
    status: 'ACTIVE',
    activeEngines: 12,
    fleetHealthAverage: 88.5,
    criticalAlertsCount: 0,
    model: 'Gemini 2.5 Flash'
  });
});

module.exports = router;
