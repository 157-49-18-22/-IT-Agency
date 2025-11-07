const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const TimeTracking = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { project, user, startDate, endDate } = req.query;
    let query = {};
    
    if (project) query.project = project;
    if (user) query.user = user;
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const entries = await TimeTracking.find(query)
      .populate('user', 'name email')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ startTime: -1 });

    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = await TimeTracking.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/stop', async (req, res) => {
  try {
    const entry = await TimeTracking.findByIdAndUpdate(
      req.params.id,
      { endTime: new Date(), status: 'Stopped' },
      { new: true }
    );
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
