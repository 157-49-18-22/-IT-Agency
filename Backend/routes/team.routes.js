const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { department, status, role } = req.query;
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;

    const team = await User.find(query).select('-password');
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
