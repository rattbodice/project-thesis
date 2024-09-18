const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TextContent = sequelize.define('TextContent', {
  
  text_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text_content: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
});

module.exports = TextContent;
