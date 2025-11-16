const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['functional', 'integration', 'regression', 'smoke', 'sanity', 'performance'],
    default: 'functional'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not_run', 'passed', 'failed', 'blocked'],
    default: 'not_run'
  },
  steps: [{
    step: String,
    expected: String
  }],
  expectedResult: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastRun: {
    type: Date
  },
  testResults: [{
    status: {
      type: String,
      enum: ['passed', 'failed', 'blocked'],
      required: true
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    executedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('TestCase', testCaseSchema);
