const express = require('express');
const router = express.Router();
const uatController = require('../controllers/uat.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

// Create a new UAT test case
router.post('/', 
  authorize(['admin', 'tester', 'project_manager']), 
  uatController.createUAT
);

// Get all UAT test cases
router.get('/', uatController.getAllUATs);

// Get a single UAT test case by ID
router.get('/:id', uatController.getUATById);

// Update a UAT test case
router.put('/:id', 
  authorize(['admin', 'tester', 'project_manager']), 
  uatController.updateUAT
);

// Delete a UAT test case
router.delete('/:id', 
  authorize(['admin', 'project_manager']), 
  uatController.deleteUAT
);

// Update UAT status
router.patch('/:id/status', 
  authorize(['admin', 'tester', 'project_manager']), 
  uatController.updateUATStatus
);

module.exports = router;
