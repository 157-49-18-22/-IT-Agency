const { Model, DataTypes } = require('../../sequelize');
const sequelize = require('../../config/database');

class Mockup extends Model {
  static associate(models) {
    // Define associations here
    Mockup.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    
    Mockup.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    Mockup.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });
  }
}

Mockup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0'
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_review', 'approved', 'rejected'),
      defaultValue: 'draft'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Mockup',
    tableName: 'mockups',
    paranoid: true,
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] }
    }
  }
);

module.exports = Mockup;
