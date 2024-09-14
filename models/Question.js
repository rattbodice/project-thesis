const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Video = require('./Video');

const Question = sequelize.define('Question', {
  time_in_video: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  correct_answer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  video_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Video,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Question.belongsTo(Video, { foreignKey: 'video_id' });
module.exports = Question;
