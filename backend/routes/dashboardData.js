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

// Helper to auto-seed hypothetical data on first load
async function seedDefaultData(userId) {
  const leaveCount = await LeaveRequest.countDocuments();
  if (leaveCount === 0) {
    await LeaveRequest.create([
      { user: userId, fullName: 'Capt. Rajesh Sharma', duration: '12 Aug - 22 Aug (10 Days)', reason: 'Annual Leave request', status: 'Pending', priority: 'Medium' }
    ]);
  }

  const spareCount = await SpareRequest.countDocuments();
  if (spareCount === 0) {
    await SpareRequest.create([
      { user: userId, fullName: 'Lt. Vikram Singh', item: '1x Arjun Spares Pack (Gearbox Assemblies)', qty: '4 units', dept: 'Mechanical Div', status: 'Pending', priority: 'High' },
      { user: userId, fullName: 'Capt. Rajesh Sharma', item: 'Cummins QSK19 Diesel Block', qty: '1 unit', dept: 'Armor & Hull', status: 'Pending', priority: 'Critical' }
    ]);
  }

  const workOrderCount = await WorkOrder.countDocuments();
  if (workOrderCount === 0) {
    await WorkOrder.create([
      { user: userId, fullName: 'Capt. Rajesh Sharma', title: 'Hangar #3 Transmission Overhaul', desc: 'Complete teardown and calibration of Arjun Mk1A transmission assembly.', dept: 'Mechanical Div', status: 'Pending', priority: 'High' }
    ]);
  }

  const issueCount = await Issue.countDocuments();
  if (issueCount === 0) {
    await Issue.create([
      { user: userId, fullName: 'Capt. Rajesh Sharma', title: 'Hangar 4 Compressor Fault', desc: 'Main pressure lines fluctuate above 12 bar limit.', dept: 'Mechanical Div', status: 'Open', priority: 'High' }
    ]);
  }

  const msgCount = await Message.countDocuments();
  if (msgCount === 0) {
    await Message.create([
      { senderName: 'Col. Sandeep Mehta', senderRole: 'Regiment Commander', text: 'Please submit the Arjun Mk1A engine wear telemetry report by 1500 hrs today.', unread: true, replies: [] },
      { senderName: 'Lt. Vikram Singh', senderRole: 'Hangar Supervisor', text: 'Hangar 3 track tension tool calibrated. Ready for your inspection.', unread: false, replies: [] },
      { senderName: 'HQ Tech Wing', senderRole: 'System Admin', text: 'System security patch 4.2-A deployed. Verify telemetry sensor readings.', unread: false, replies: [] }
    ]);
  }

  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    await Event.create([
      { title: 'Morning Muster & Tactical Briefing', date: new Date().toISOString().split('T')[0], time: '08:30', category: 'Schedule', status: 'Completed' },
      { title: 'Arjun Unit #04 Engine Overhaul Audit', date: new Date().toISOString().split('T')[0], time: '10:00', category: 'Schedule', status: 'In Progress' },
      { title: 'Diagnostics Sensor Review Hangar 4', date: new Date().toISOString().split('T')[0], time: '14:30', category: 'Meeting', status: 'Scheduled' },
      { title: 'Weekly Regiment Readiness Meeting', date: new Date().toISOString().split('T')[0], time: '16:00', category: 'Meeting', status: 'Scheduled' },
      { title: 'Fleet Calibration Audit', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:00', category: 'Maintenance', status: 'Scheduled' }
    ]);
  }

  const docCount = await Document.countDocuments();
  if (docCount === 0) {
    await Document.create([
      { title: 'ARJUN_MK1A_OPERATIONS_MANUAL.pdf', desc: 'Main diagnostic guidelines', size: '14.2 MB', state: 'Pinned' },
      { title: 'FLEET_DIAGNOSTICS_REPORT_Q2.xlsx', desc: 'Performance records logs', size: '2.8 MB', state: 'Modified 4h ago' },
      { title: 'AMMUNITION_ALLOCATION_ORDER_77.pdf', desc: 'Munitions deployment orders', size: '1.1 MB', state: 'Shared Yesterday' }
    ]);
  }

  const logCount = await ActivityLog.countDocuments();
  if (logCount === 0) {
    await ActivityLog.create([
      { username: 'admin', fullName: 'CommandHQ Admin', text: 'Admin initialized credentials check.', icon: 'security', type: 'Admin' },
      { username: 'user', fullName: 'Capt. Rajesh Sharma', text: 'Task "Fleet Readiness Review" completion state toggled.', icon: 'check_circle', type: 'User' },
      { username: 'user', fullName: 'Capt. Rajesh Sharma', text: 'Inventory request for Synthetic Lubricant 50L submitted.', icon: 'inventory', type: 'User' }
    ]);
  }
}

// @route   GET /api/dashboard-data
// @desc    Get all custom dashboard records
router.get('/', protect, async (req, res) => {
  try {
    await seedDefaultData(req.user._id);

    const leaveRequests = await LeaveRequest.find({});
    const spareRequests = await SpareRequest.find({});
    const workOrders = await WorkOrder.find({});
    const issues = await Issue.find({});
    const messages = await Message.find({}).sort({ createdAt: -1 });
    const events = await Event.find({});
    const documents = await Document.find({});
    const activityLogs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(10);
    const announcements = await Notification.find({ type: 'Announcement' }).sort({ date: -1 }).limit(5);

    res.json({
      leaveRequests,
      spareRequests,
      workOrders,
      issues,
      messages,
      events,
      documents,
      activityLogs,
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/leave
router.post('/leave', protect, async (req, res) => {
  try {
    const { duration, reason, priority } = req.body;
    const leave = await LeaveRequest.create({
      user: req.user._id,
      fullName: req.user.fullName || 'Capt. Rajesh Sharma',
      duration,
      reason: reason || 'Annual Leave Cycle',
      priority: priority || 'Medium'
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Submitted leave request for ${duration}`,
      icon: 'calendar_today',
      type: 'User'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/spare
router.post('/spare', protect, async (req, res) => {
  try {
    const { item, qty, dept, priority } = req.body;
    const spare = await SpareRequest.create({
      user: req.user._id,
      fullName: req.user.fullName || 'Capt. Rajesh Sharma',
      item,
      qty,
      dept,
      priority: priority || 'Medium'
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Requested inventory spare parts: ${item} (Qty: ${qty})`,
      icon: 'inventory',
      type: 'User'
    });

    res.status(201).json(spare);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/workorder
router.post('/workorder', protect, async (req, res) => {
  try {
    const { title, desc, dept, priority } = req.body;
    const workOrder = await WorkOrder.create({
      user: req.user._id,
      fullName: req.user.fullName || 'Capt. Rajesh Sharma',
      title,
      desc,
      dept,
      priority: priority || 'Medium'
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Created maintenance work order: ${title}`,
      icon: 'build',
      type: 'User'
    });

    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/issue
router.post('/issue', protect, async (req, res) => {
  try {
    const { title, desc, dept, priority } = req.body;
    const issue = await Issue.create({
      user: req.user._id,
      fullName: req.user.fullName || 'Capt. Rajesh Sharma',
      title,
      desc,
      dept,
      priority: priority || 'Medium'
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Reported compressor/engine fault: ${title}`,
      icon: 'warning',
      type: 'User'
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/message
router.post('/message', protect, async (req, res) => {
  try {
    const { senderName, senderRole, text } = req.body;
    const message = await Message.create({
      senderName: senderName || req.user.fullName,
      senderRole: senderRole || req.user.role,
      text,
      unread: true,
      replies: []
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Sent a secure radio message: "${text.substring(0, 30)}..."`,
      icon: 'chat',
      type: 'User'
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/document
router.post('/document', protect, async (req, res) => {
  try {
    const { title, desc, size, state } = req.body;
    const document = await Document.create({
      user: req.user._id,
      title,
      desc,
      size,
      state
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Generated technical report: ${title}`,
      icon: 'description',
      type: req.user.role === 'Admin' ? 'Admin' : 'User'
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/message/:id/reply
router.post('/message/:id/reply', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.replies.push({
      senderName: req.user.fullName || 'Capt. Rajesh Sharma',
      text
    });
    message.unread = false;
    await message.save();

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Submitted reply to message from ${message.senderName}`,
      icon: 'reply',
      type: 'User'
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/dashboard-data/approval/:type/:id
// @desc    Approve/Reject requests by admin
router.put('/approval/:type/:id', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const { type, id } = req.params;
    let item;

    if (type === 'leave') {
      item = await LeaveRequest.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'spare') {
      item = await SpareRequest.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'workorder') {
      item = await WorkOrder.findByIdAndUpdate(id, { status }, { new: true });
    }

    if (!item) return res.status(404).json({ message: 'Request not found' });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `${status} request ${id} (${type.toUpperCase()}) for ${item.fullName}`,
      icon: status === 'Approved' ? 'check_circle' : 'cancel',
      type: 'Admin'
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard-data/announcement
// @desc    Broadcast directive by Admin
router.post('/announcement', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const announcement = await Notification.create({
      title: 'Command HQ Directive',
      type: 'Announcement',
      content
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Broadcasted HQ announcement: "${content.substring(0, 30)}..."`,
      icon: 'campaign',
      type: 'Admin'
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/dashboard-data/issue/:id/resolve
// @desc    Mark reported system issue as Resolved
router.put('/issue/:id/resolve', protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Marked issue "${issue.title}" as resolved.`,
      icon: 'check_circle',
      type: req.user.role === 'Admin' ? 'Admin' : 'User'
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/dashboard-data/request/:type/:id
// @desc    Withdraw or purge a user request/order
router.delete('/request/:type/:id', protect, async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    if (type === 'leave') item = await LeaveRequest.findByIdAndDelete(id);
    else if (type === 'spare') item = await SpareRequest.findByIdAndDelete(id);
    else if (type === 'workorder') item = await WorkOrder.findByIdAndDelete(id);
    else if (type === 'issue') item = await Issue.findByIdAndDelete(id);
    else if (type === 'document') item = await Document.findByIdAndDelete(id);

    if (!item) return res.status(404).json({ message: 'Request not found' });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      text: `Withdrew / deleted ${type.toUpperCase()} request: ${item.title || item.item || item.duration || id}`,
      icon: 'delete',
      type: req.user.role === 'Admin' ? 'Admin' : 'User'
    });

    res.json({ message: 'Request purged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

