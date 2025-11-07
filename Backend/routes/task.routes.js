const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Task = require('../models/sql');

router.use(protect);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { project, status, assignee } = req.query;
    let query = {};
    if (project) query.project = project;
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, reporter: req.user.id });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
