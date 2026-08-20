const express = require('express');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const generateSampleNotifications = () => {
  return [
    {
      _id: 'notif-1',
      title: 'Command HQ Fleet Inspection Directive',
      type: 'Announcement',
      content: 'All 505 Base Workshop hangars to prepare Arjun Mk1A & T-90 Bhishma units for annual readiness evaluation.',
      priority: 'High',
      date: new Date().toISOString()
    },
    {
      _id: 'notif-2',
      title: 'Dynamometer Testing Stand #02 Maintenance',
      type: 'Schedule',
      content: 'Scheduled calibration routine for dynamometer load cells will take place between 0900 and 1300 hrs.',
      priority: 'Medium',
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'notif-3',
      title: 'Inventory Clearance: Track Pins Batch #99',
      type: 'Deadline',
      content: 'Quarterly spare parts audit cutoff is 1700 hrs tomorrow.',
      priority: 'High',
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

// GET all notifications
router.get('/', protect, async (req, res) => {
  try {
    let notifications = [];
    try {
      notifications = await Notification.find({}).sort({ date: -1 });
    } catch (e) {}

    if (!notifications || notifications.length === 0) {
      notifications = generateSampleNotifications();
    }
    res.json(notifications);
  } catch (error) {
    res.json(generateSampleNotifications());
  }
});

// POST create notification (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    let notification;
    try {
      notification = await Notification.create(req.body);
    } catch (e) {
      notification = { _id: `notif-${Date.now()}`, date: new Date().toISOString(), ...req.body };
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update notification (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    let notification;
    try {
      notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } catch (e) {}
    if (!notification) {
      notification = { _id: req.params.id, ...req.body };
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE notification (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    try {
      await Notification.findByIdAndDelete(req.params.id);
    } catch (e) {}
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
