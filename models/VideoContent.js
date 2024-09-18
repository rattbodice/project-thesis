const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoContent = sequelize.define('VideoContent', {
  
  video_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  video_url: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
});

module.exports = VideoContent;
