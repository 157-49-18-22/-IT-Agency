const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const Project = require('../models/sql');
    const Task = require('../models/sql');
    const User = require('../models/sql');

    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'In Progress' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const teamMembers = await User.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        teamMembers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
