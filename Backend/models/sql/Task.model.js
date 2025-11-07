const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'review', 'completed', 'blocked'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  type: {
    type: DataTypes.ENUM('Feature', 'Bug', 'Enhancement', 'Research', 'Documentation'),
    defaultValue: 'Feature'
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  actualHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  checklist: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  sprint: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  storyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  phase: {
    type: DataTypes.ENUM('UI/UX', 'Development', 'Testing'),
    defaultValue: 'Development'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['assigneeId'] },
    { fields: ['status'] },
    { fields: ['dueDate'] }
  ]
});

module.exports = Task;
