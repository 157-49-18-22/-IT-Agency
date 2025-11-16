const TestCase = require('../models/TestCase.model');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Create a new test case
// @route   POST /api/test-cases
// @access  Private
exports.createTestCase = async (req, res, next) => {
  try {
    const testCase = new TestCase({
      ...req.body,
      createdBy: req.user.id
    });

    await testCase.save();
    
    // Populate createdBy and assignedTo fields with user details
    await testCase.populate('createdBy', 'name email');
    if (testCase.assignedTo) {
      await testCase.populate('assignedTo', 'name email');
    }
    if (testCase.project) {
      await testCase.populate('project', 'name');
    }

    res.status(201).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all test cases
// @route   GET /api/test-cases
// @access  Private
exports.getTestCases = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = TestCase.find(JSON.parse(queryStr))
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await TestCase.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const testCases = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: testCases.length,
      pagination,
      data: testCases
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single test case
// @route   GET /api/test-cases/:id
// @access  Private
exports.getTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update test case
// @route   PUT /api/test-cases/:id
// @access  Private
exports.updateTestCase = async (req, res, next) => {
  try {
    let testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is the creator or admin
    if (testCase.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this test case`, 401));
    }

    testCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.status(200).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete test case
// @route   DELETE /api/test-cases/:id
// @access  Private
exports.deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is the creator or admin
    if (testCase.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this test case`, 401));
    }

    await testCase.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add test result
// @route   POST /api/test-cases/:id/results
// @access  Private
exports.addTestResult = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const testCase = await TestCase.findById(req.params.id);
    
    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    const testResult = {
      status,
      notes,
      executedBy: req.user.id
    };

    testCase.testResults.push(testResult);
    testCase.status = status;
    testCase.lastRun = Date.now();
    
    await testCase.save();
    
    // Populate the test result with user details
    await testCase.populate('testResults.executedBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    next(error);
  }
};
