const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const basename = path.basename(__filename);
const db = {};

// Import database configuration
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging || false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import all models from sql directory
const modelDir = path.join(__dirname, 'sql');

fs.readdirSync(modelDir)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-10) === '.model.js' &&
      !file.includes('.test.js')
    );
  })
  .forEach(file => {
    const modelPath = path.join(modelDir, file);
    const modelModule = require(modelPath);
    // Handle both module.exports = model and module.exports = (sequelize, DataTypes) => ...
    const model = typeof modelModule === 'function' 
      ? modelModule(sequelize, Sequelize.DataTypes)
      : modelModule;
    db[model.name] = model;
  });

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
