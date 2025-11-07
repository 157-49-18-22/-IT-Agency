const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Deliverable = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { project, phase, status } = req.query;
    let query = { isArchived: false };
    if (project) query.project = project;
    if (phase) query.phase = phase;
    if (status) query.status = status;

    const deliverables = await Deliverable.find(query)
      .populate('project', 'name')
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: deliverables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const deliverable = await Deliverable.create({ ...req.body, uploadedBy: req.user.id });
    res.status(201).json({ success: true, data: deliverable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const deliverable = await Deliverable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: deliverable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
