const mongoose = require('mongoose');

const dyGmBoardSchema = new mongoose.Schema({
  // Stripping Division
  strippingCompleted: { type: String, default: '50' },
  strippingUnderProcess: { type: String, default: '02' },
  strippingFwdForWashing: { type: String, default: '48' },
  strippingPending: { type: String, default: '03' },

  // Washing Division
  washingLcc: { type: String, default: '46' },
  washingUcc: { type: String, default: '46' },
  washingBlockOut: { type: String, default: '45' },
  washingCylHeadOut: { type: String, default: '45' },
  washingCrankshaftOut: { type: String, default: '48' },
  washingSupercharger: { type: String, default: '39' },
  washingFip: { type: String, default: '41' },

  // Machine Shop
  machineCompHeld: { type: String, default: '08' },
  machineCompDone: { type: String, default: '29' },
  machineCompSent: { type: String, default: '29' },
  machineShellHeld: { type: String, default: '05' },
  machineWorkPending: { type: String, default: '14' },

  // Line Boring Section
  boringPrepTillDate: { type: String, default: '30' },
  boringLastMonthProgress: { type: String, default: '26' },
  boringCuttingOfShell: { type: String, default: '32' },
  boringShellForCoating: { type: String, default: '33' },
  boringBlockCompleted: { type: String, default: '31' },

  // Sub Assembly Division
  subJacketsDone: { type: String, default: '25' },
  subFipDone: { type: String, default: '28' },
  subLinerDone: { type: String, default: '24' },
  subLinerBalance: { type: String, default: '02' },
  subEngWaterTest: { type: String, default: '28' },
  subCylHeadDone: { type: String, default: '26' },
  subSuperchargerDone: { type: String, default: '26' },
  subAwaitingWaterTest: { type: String, default: '05' },

  // Main Assembly Area
  assemblyStage1: { type: String, default: '01' },
  assemblyStage2: { type: String, default: '01' },
  assemblyStage3: { type: String, default: '--' },
  assemblyStage4: { type: String, default: '--' },
  assemblyStage5: { type: String, default: '--' },
  assemblyTotal: { type: String, default: '25' },

  // Executive Summary
  summaryWcnAwaiting: { type: String, default: 'NIL' },
  summaryWcnComplete: { type: String, default: '19' },
  summaryAwaitingPass: { type: String, default: '06' },
}, { timestamps: true });

module.exports = mongoose.model('DyGmBoard', dyGmBoardSchema);
