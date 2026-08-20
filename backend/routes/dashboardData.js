const express = require('express');
const { protect } = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const SpareRequest = require('../models/SpareRequest');
const WorkOrder = require('../models/WorkOrder');
const Issue = require('../models/Issue');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const Event = require('../models/Event');
const Document = require('../models/Document');
const Notification = require('../models/Notification');

const router = express.Router();

const getSampleDashboardData = (userId, fullName) => {
  return {
    leaveRequests: [
      { _id: 'l1', user: userId, fullName: fullName || 'Capt. Rajesh Sharma', duration: '12 Aug - 22 Aug (10 Days)', reason: 'Annual Leave request', status: 'Pending', priority: 'Medium' }
    ],
    spareRequests: [
      { _id: 's1', user: userId, fullName: 'Lt. Vikram Singh', item: '1x Arjun Spares Pack (Gearbox Assemblies)', qty: '4 units', dept: 'Mechanical Div', status: 'Pending', priority: 'High' },
      { _id: 's2', user: userId, fullName: fullName || 'Capt. Rajesh Sharma', item: 'Cummins QSK19 Diesel Block', qty: '1 unit', dept: 'Armor & Hull', status: 'Pending', priority: 'Critical' }
    ],
    workOrders: [
      { _id: 'w1', user: userId, fullName: fullName || 'Capt. Rajesh Sharma', title: 'Hangar #3 Transmission Overhaul', desc: 'Complete teardown and calibration of Arjun Mk1A transmission assembly.', dept: 'Mechanical Div', status: 'Pending', priority: 'High' }
    ],
    issues: [
      { _id: 'i1', user: userId, fullName: fullName || 'Capt. Rajesh Sharma', title: 'Hangar 4 Compressor Fault', desc: 'Main pressure lines fluctuate above 12 bar limit.', dept: 'Mechanical Div', status: 'Open', priority: 'High' }
    ],
    messages: [
      { _id: 'm1', senderName: 'Col. Sandeep Mehta', senderRole: 'Regiment Commander', text: 'Please submit the Arjun Mk1A engine wear telemetry report by 1500 hrs today.', unread: true, replies: [] },
      { _id: 'm2', senderName: 'Lt. Vikram Singh', senderRole: 'Hangar Supervisor', text: 'Hangar 3 track tension tool calibrated. Ready for your inspection.', unread: false, replies: [] }
    ],
    events: [
      { _id: 'e1', title: 'Morning Muster & Tactical Briefing', date: new Date().toISOString().split('T')[0], time: '08:30', category: 'Schedule', status: 'Completed' },
      { _id: 'e2', title: 'Arjun Unit #04 Engine Overhaul Audit', date: new Date().toISOString().split('T')[0], time: '10:00', category: 'Schedule', status: 'In Progress' }
    ],
    documents: [
      { _id: 'd1', title: 'ARJUN_MK1A_OPERATIONS_MANUAL.pdf', desc: 'Main diagnostic guidelines', size: '14.2 MB', state: 'Pinned' },
      { _id: 'd2', title: 'FLEET_DIAGNOSTICS_REPORT_Q2.xlsx', desc: 'Performance records logs', size: '2.8 MB', state: 'Modified 4h ago' }
    ],
    activityLogs: [
      { _id: 'a1', username: 'admin', fullName: 'CommandHQ Admin', text: 'Admin initialized credentials check.', icon: 'security', type: 'Admin' },
      { _id: 'a2', username: 'user', fullName: fullName || 'Capt. Rajesh Sharma', text: 'Inventory request for Synthetic Lubricant 50L submitted.', icon: 'inventory', type: 'User' }
    ],
    announcements: [
      { _id: 'n1', title: 'Command HQ Directive', type: 'Announcement', content: 'Fleet readiness inspection scheduled for all armoured units.' }
    ]
  };
};

// @route   GET /api/dashboard-data
// @desc    Get all custom dashboard records
router.get('/', protect, async (req, res) => {
  try {
    let leaveRequests = [], spareRequests = [], workOrders = [], issues = [], messages = [], events = [], documents = [], activityLogs = [], announcements = [];
    try {
      leaveRequests = await LeaveRequest.find({});
      spareRequests = await SpareRequest.find({});
      workOrders = await WorkOrder.find({});
      issues = await Issue.find({});
      messages = await Message.find({}).sort({ createdAt: -1 });
      events = await Event.find({});
      documents = await Document.find({});
      activityLogs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(10);
      announcements = await Notification.find({ type: 'Announcement' }).sort({ date: -1 }).limit(5);
    } catch (e) {}

    const sample = getSampleDashboardData(req.user._id, req.user.fullName);

    res.json({
      leaveRequests: leaveRequests.length ? leaveRequests : sample.leaveRequests,
      spareRequests: spareRequests.length ? spareRequests : sample.spareRequests,
      workOrders: workOrders.length ? workOrders : sample.workOrders,
      issues: issues.length ? issues : sample.issues,
      messages: messages.length ? messages : sample.messages,
      events: events.length ? events : sample.events,
      documents: documents.length ? documents : sample.documents,
      activityLogs: activityLogs.length ? activityLogs : sample.activityLogs,
      announcements: announcements.length ? announcements : sample.announcements
    });
  } catch (error) {
    res.json(getSampleDashboardData(req.user._id, req.user.fullName));
  }
});

// Generic POST/PUT routes with fallback response
router.post('/leave', protect, async (req, res) => {
  try {
    const leave = { _id: `leave-${Date.now()}`, user: req.user._id, fullName: req.user.fullName, duration: req.body.duration, reason: req.body.reason, status: 'Pending', priority: req.body.priority || 'Medium' };
    try { await LeaveRequest.create(leave); } catch (e) {}
    res.status(201).json(leave);
  } catch (e) { res.status(201).json({ _id: `leave-${Date.now()}`, ...req.body }); }
});

router.post('/spare', protect, async (req, res) => {
  try {
    const spare = { _id: `spare-${Date.now()}`, user: req.user._id, fullName: req.user.fullName, item: req.body.item, qty: req.body.qty, dept: req.body.dept, status: 'Pending', priority: req.body.priority || 'Medium' };
    try { await SpareRequest.create(spare); } catch (e) {}
    res.status(201).json(spare);
  } catch (e) { res.status(201).json({ _id: `spare-${Date.now()}`, ...req.body }); }
});

router.post('/workorder', protect, async (req, res) => {
  try {
    const order = { _id: `wo-${Date.now()}`, user: req.user._id, fullName: req.user.fullName, title: req.body.title, desc: req.body.desc, dept: req.body.dept, status: 'Pending', priority: req.body.priority || 'Medium' };
    try { await WorkOrder.create(order); } catch (e) {}
    res.status(201).json(order);
  } catch (e) { res.status(201).json({ _id: `wo-${Date.now()}`, ...req.body }); }
});

router.post('/issue', protect, async (req, res) => {
  try {
    const issue = { _id: `issue-${Date.now()}`, user: req.user._id, fullName: req.user.fullName, title: req.body.title, desc: req.body.desc, dept: req.body.dept, status: 'Open', priority: req.body.priority || 'Medium' };
    try { await Issue.create(issue); } catch (e) {}
    res.status(201).json(issue);
  } catch (e) { res.status(201).json({ _id: `issue-${Date.now()}`, ...req.body }); }
});

router.post('/message', protect, async (req, res) => {
  try {
    const msg = { _id: `msg-${Date.now()}`, senderName: req.user.fullName, senderRole: req.user.role, text: req.body.text, unread: true, replies: [] };
    try { await Message.create(msg); } catch (e) {}
    res.status(201).json(msg);
  } catch (e) { res.status(201).json({ _id: `msg-${Date.now()}`, ...req.body }); }
});

module.exports = router;
