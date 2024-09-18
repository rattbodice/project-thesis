const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Document = sequelize.define('Document', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Document.belongsTo(User, { foreignKey: 'created_by' });
module.exports = Document;
