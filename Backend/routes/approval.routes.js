const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Approval = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, type, project } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (project) query.project = project;

    const approvals = await Approval.find(query)
      .populate('project', 'name')
      .populate('requestedBy', 'name email avatar')
      .populate('requestedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const approval = await Approval.create({ ...req.body, requestedBy: req.user.id });
    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', rejectedAt: Date.now(), rejectionReason: req.body.reason },
      { new: true }
    );
    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
