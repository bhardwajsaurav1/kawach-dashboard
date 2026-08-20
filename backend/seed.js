const mongoose = require('mongoose');
const User = require('./models/User');
const Tank = require('./models/Tank');
const Personnel = require('./models/Personnel');
const Workforce = require('./models/Workforce');
const OverhaulStage = require('./models/OverhaulStage');
const Testing = require('./models/Testing');
const Inventory = require('./models/Inventory');
const Notification = require('./models/Notification');
const DyGmBoard = require('./models/DyGmBoard');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Mongoose connection managed by connectDB or caller

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Tank.deleteMany();
    await Personnel.deleteMany();
    await Workforce.deleteMany();
    await OverhaulStage.deleteMany();
    await Testing.deleteMany();
    await Inventory.deleteMany();
    await Notification.deleteMany();
    await DyGmBoard.deleteMany();

    console.log('Cleared existing database data.');

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'Admin',
      fullName: 'CommandHQ Admin',
      email: 'admin@armor-dt.mil'
    });
    
    // Create User User
    const regularUser = await User.create({
      username: 'user',
      password: 'user123',
      role: 'User',
      fullName: 'Regular Operator',
      email: 'user@armor-dt.mil'
    });

    console.log('Users seeded');

    // Create Tanks (50 tanks)
    const models = ['T-72', 'T-90', 'T-72 Ajeya', 'Arjun', 'Arjun MK1A', 'BMP-2 Sarath'];
    const statuses = ['Active', 'Under Maintenance', 'Overhaul', 'Reserved', 'Decommissioned'];
    const locations = ['Northern Command', 'Western Command', 'Eastern Command', 'Southern Command', 'South Western Command', 'Central Command'];
    const manufacturers = ['Heavy Vehicles Factory', 'Avadi HVF', 'BEML', 'Ordnance Factory Board'];

    const tanksData = [];
    for (let i = 1; i <= 50; i++) {
      const model = models[i % models.length];
      const status = statuses[i % statuses.length];
      const loc = locations[i % locations.length];
      const man = manufacturers[i % manufacturers.length];
      const tankId = `TNK-${10000 + i}`;
      const regNum = `ARJ-${2020 + (i % 5)}-${100 + i}`;
      
      const history = [
        { date: new Date(2025, 0, (i % 28) + 1), type: 'Routine', description: 'Filters and oil change', technician: 'WF-101', cost: 1200 },
        { date: new Date(2025, 5, (i % 28) + 1), type: 'Repair', description: 'Track suspension calibration', technician: 'WF-102', cost: 3500 }
      ];

      tanksData.push({
        tankId,
        registrationNumber: regNum,
        tankModel: model,
        manufacturer: man,
        manufacturingYear: 2010 + (i % 15),
        engineNumber: `ENG-${50000 + i}`,
        chassisNumber: `CH-${60000 + i}`,
        unitAssignment: `${10 + (i % 10)} ARMOURED REGT`,
        currentLocation: loc,
        operationalStatus: status,
        lastServiceDate: new Date(2025, 5, (i % 28) + 1),
        nextScheduledService: new Date(2026, 0, (i % 28) + 1),
        engineHours: 120 + (i * 24),
        kilometersCovered: 800 + (i * 50),
        weaponSystemDetails: '120mm rifled gun, PKT 7.62mm machine gun',
        ammunitionCapacity: 39,
        fuelCapacity: 1610,
        maintenanceNotes: 'Monitor engine oil pressure and transmission temperature.',
        serviceHistory: history
      });
    }
    const tanks = await Tank.insertMany(tanksData);
    console.log('Tanks seeded: ' + tanks.length);

    // Create Personnel
    const personnelData = [
      { armyId: 'SN-77421-A', fullName: 'Havildar Rajesh Kumar', rank: 'Havildar', unit: '75 ARMOURED REGIMENT', branch: 'Armoured Corps', securityClearance: 'L2: TACTICAL', assignedTank: tanks[0]._id },
      { armyId: 'SN-99812-B', fullName: 'Sepoy Amit Verma', rank: 'Sepoy', unit: '75 ARMOURED REGIMENT', branch: 'Armoured Corps', securityClearance: 'L1: BASIC', assignedTank: tanks[0]._id },
    ];
    await Personnel.insertMany(personnelData);
    console.log('Personnel seeded');

    // Create Workforce (100 workers)
    const depts = ['Engine Bay', 'Avionics', 'Transmission', 'Weapon Systems', 'Armor'];
    const designations = ['Senior Engineer', 'Technician', 'Junior Mechanic', 'Apprentice', 'Inspector'];
    const skills = ['Junior', 'Senior', 'Master', 'Expert'];
    const shifts = ['Morning', 'Evening', 'Night', 'Rotational'];

    const workforceData = [];
    for (let i = 1; i <= 100; i++) {
      const dept = depts[i % depts.length];
      const des = designations[i % designations.length];
      const skill = skills[i % skills.length];
      const shift = shifts[i % shifts.length];
      
      let att = 'Present';
      const rand = Math.random();
      if (rand > 0.95) att = 'Absent';
      else if (rand > 0.85) att = 'On Leave';

      const checkIn = att === 'Present' ? '08:30' : '';
      const checkOut = att === 'Present' ? '17:30' : '';
      const hrs = att === 'Present' ? 9 : 0;

      workforceData.push({
        employeeId: `WF-${100 + i}`,
        name: `Worker ${i}`,
        department: dept,
        designation: des,
        trade: i % 2 === 0 ? 'Mechanic' : 'Electrician',
        skillLevel: skill,
        experience: 2 + (i % 15),
        shift: shift,
        supervisor: 'Col. Sandeep Mehta',
        contactNumber: `9876543${100 + i}`,
        email: `worker${i}@armor-dt.mil`,
        assignedWorkshop: `Workshop ${1 + (i % 4)}`,
        availability: att === 'On Leave' ? 'On Leave' : (att === 'Present' ? 'Available' : 'On Leave'),
        joiningDate: new Date(2020, 0, (i % 28) + 1),
        attendanceStatus: att,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalWorkingHours: hrs,
        remarks: 'Complies with all safety and workshop standards.'
      });
    }
    const seededWorkforce = await Workforce.insertMany(workforceData);
    console.log('Workforce seeded: ' + seededWorkforce.length);

    // Create Overhaul Stages
    await OverhaulStage.insertMany([
      { tank: tanks[2]._id, stageNumber: 1, stageName: 'INITIAL INSPECTION', status: 'COMPLETED', workshopTeam: 'ALPHA' },
      { tank: tanks[2]._id, stageNumber: 2, stageName: 'ENGINE OVERHAUL', status: 'IN-PROGRESS', workshopTeam: 'BRAVO' },
      { tank: tanks[2]._id, stageNumber: 3, stageName: 'TRANSMISSION REPAIR', status: 'PENDING', workshopTeam: 'CHARLIE' },
    ]);
    console.log('Overhaul Stages seeded');

    // Create Testing Records (25 records)
    const testStages = ['Engine Bench Test', 'Transmission Load Test', 'Armor Integrity Scan', 'Weapon Systems Calibration', 'Suspension Stress Test'];
    const testResults = ['Pass', 'Fail', 'In Progress'];
    const officers = ['Lt. Col. Rajat Sharma', 'Major Harish Sen', 'Capt. Sneha Reddy', 'Lt. Col. Amit Rawat'];

    const testingData = [];
    for (let i = 1; i <= 25; i++) {
      const stage = testStages[i % testStages.length];
      const result = testResults[i % testResults.length];
      const officer = officers[i % officers.length];
      
      testingData.push({
        tankId: tanks[i % tanks.length]._id,
        tankNumber: tanks[i % tanks.length].registrationNumber,
        testingSchedule: new Date(2026, 6, (i % 28) + 1),
        testingStage: stage,
        testResult: result,
        assignedOfficer: officer,
        completionDate: result !== 'In Progress' ? new Date(2026, 6, (i % 28) + 2) : null
      });
    }
    await Testing.insertMany(testingData);
    console.log('Testing seeded');

    // Create Inventory Records (105 records)
    const partNames = [
      'Engine Filter Element', 'Transmission Gear A', 'Suspension Torsion Bar', 'Laser Range Finder Module',
      'Track Link Pin', 'Thermal Imaging Sensor', 'APFSDS Ammunition Box', 'Fuel Injector Nozzle',
      'Radiator Core', 'Brake Pad Set', 'Hydraulic Pump Seal', 'Turret Drive Motor',
      'Exhaust Manifold Gasket', 'Battery 12V 100Ah', 'Smoke Grenade Launcher Tube', 'Alternator Belt'
    ];
    const supplierNames = ['Tata Advanced Systems', 'L&T Defense', 'Bharat Forge', 'OFB Avadi', 'BEL India'];

    const inventoryData = [];
    for (let i = 1; i <= 105; i++) {
      const name = partNames[i % partNames.length];
      const supplier = supplierNames[i % supplierNames.length];
      const minStock = 10 + (i % 20);
      const available = i % 8 === 0 ? minStock - Math.floor(Math.random() * 5 + 1) : minStock + Math.floor(Math.random() * 40 + 5);

      inventoryData.push({
        partId: `PRT-${1000 + i}`,
        partName: `${name} v${1 + (i % 3)}`,
        availableQuantity: available,
        minimumStockLevel: minStock,
        supplierInfo: supplier,
        partsIssued: 5 + (i % 15),
        partsReturned: i % 3 === 0 ? Math.floor(Math.random() * 3) : 0
      });
    }
    await Inventory.insertMany(inventoryData);
    console.log('Inventory seeded');

    // Create Notifications (12 records)
    const notifTypes = ['Conference', 'Meeting', 'Deadline', 'Announcement'];
    const notifTitles = [
      'Annual Fleet Readiness Review', 'Weekly Safety Briefing', 'Engine Maintenance Deadline',
      'New Armor Upgrades Announcement', 'Joint Command Testing Schedule', 'Workshop Protocol Refresher',
      'Q3 Resource Allocation Review', 'Emergency Fire Drill Schedule', 'Avionics Spares Restocking Notice'
    ];

    const notificationData = [];
    for (let i = 1; i <= 12; i++) {
      const type = notifTypes[i % notifTypes.length];
      const title = notifTitles[i % notifTypes.length];
      
      notificationData.push({
        title,
        type,
        content: `This is a secure military announcement regarding ${title.toLowerCase()}. Please ensure all personnel are briefed and tasks are aligned accordingly. All actions must comply with standard workshop security parameters.`,
        date: new Date(2026, 6, 18 - (i % 5))
      });
    }
    await Notification.insertMany(notificationData);
    console.log('Notifications seeded');

    // Create DyGM Board hypothetical initial data
    await DyGmBoard.create({
      strippingCompleted: '50',
      strippingUnderProcess: '02',
      strippingFwdForWashing: '48',
      strippingPending: '03',

      washingLcc: '46',
      washingUcc: '46',
      washingBlockOut: '45',
      washingCylHeadOut: '45',
      washingCrankshaftOut: '48',
      washingSupercharger: '39',
      washingFip: '41',

      machineCompHeld: '08',
      machineCompDone: '29',
      machineCompSent: '29',
      machineShellHeld: '05',
      machineWorkPending: '14',

      boringPrepTillDate: '30',
      boringLastMonthProgress: '26',
      boringCuttingOfShell: '32',
      boringShellForCoating: '33',
      boringBlockCompleted: '31',

      subJacketsDone: '25',
      subFipDone: '28',
      subLinerDone: '24',
      subLinerBalance: '02',
      subEngWaterTest: '28',
      subCylHeadDone: '26',
      subSuperchargerDone: '26',
      subAwaitingWaterTest: '05',

      assemblyStage1: '01',
      assemblyStage2: '01',
      assemblyStage3: '--',
      assemblyStage4: '01',
      assemblyStage5: '--',
      assemblyTotal: '25',

      summaryWcnAwaiting: 'NIL',
      summaryWcnComplete: '19',
      summaryAwaitingPass: '06',
    });
    console.log('DyGM Board initial data seeded');

    console.log('Data seeding complete!');
    return true;
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
};

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kavach')
    .then(() => seedData())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seedData;

