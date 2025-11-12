const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/database.sql');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Project Manager', 'Developer', 'Designer', 'Tester', 'Client'),
    defaultValue: 'Developer'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  department: {
    type: DataTypes.ENUM('Development', 'Design', 'Marketing', 'Sales', 'Support', 'Management'),
    defaultValue: 'Development'
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on-leave'),
    defaultValue: 'active'
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'light'
    }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Password hashing temporarily disabled for development
    beforeCreate: async (user) => {
      // Password will be stored as plain text
      // No hashing applied
    },
    beforeUpdate: async (user) => {
      // Password will be stored as plain text
      // No hashing applied
    }
  }
});

// Instance method to compare password (plain text comparison for development)
User.prototype.comparePassword = async function(candidatePassword) {
  // Temporary: Compare plain text passwords
  return candidatePassword === this.password;
};

// Don't return password by default
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User;
