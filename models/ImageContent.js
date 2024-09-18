const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageContent = sequelize.define('ImageContent', {
  
  image_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
});

module.exports = ImageContent;
