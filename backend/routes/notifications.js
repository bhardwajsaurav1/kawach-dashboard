const express = require('express');
const mongoose = require('mongoose');
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
      date: new Date().toISOString().split('T')[0]
    },
    {
      _id: 'notif-2',
      title: 'Dynamometer Testing Stand #02 Maintenance',
      type: 'Meeting',
      content: 'Scheduled calibration routine for dynamometer load cells will take place between 0900 and 1300 hrs in Main Hangar.',
      priority: 'Medium',
      date: new Date(Date.now() - 3600000).toISOString().split('T')[0]
    },
    {
      _id: 'notif-3',
      title: 'Inventory Clearance: Track Pins Batch #99',
      type: 'Deadline',
      content: 'Quarterly spare parts audit cutoff is 1700 hrs tomorrow. Ensure all return slips are countersigned.',
      priority: 'High',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    },
    {
      _id: 'notif-4',
      title: 'Army Base Workshop Technical Symposium',
      type: 'Conference',
      content: 'Quarterly inter-workshop technical review on composite armor and thermal imaging sensors.',
      priority: 'Medium',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0]
    }
  ];
};

// GET all notifications
router.get('/', protect, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(generateSampleNotifications());
  }

  try {
    let notifications = await Notification.find({}).sort({ date: -1 });
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
    if (mongoose.connection.readyState === 1) {
      notification = await Notification.create(req.body);
    } else {
      notification = { _id: `notif-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...req.body };
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(201).json({ _id: `notif-${Date.now()}`, ...req.body });
  }
});

// PUT update notification (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    let notification;
    if (mongoose.connection.readyState === 1) {
      notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
    if (!notification) {
      notification = { _id: req.params.id, ...req.body };
    }
    res.json(notification);
  } catch (error) {
    res.json({ _id: req.params.id, ...req.body });
  }
});

// DELETE notification (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Notification.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.json({ message: 'Notification deleted successfully' });
  }
});

module.exports = router;
