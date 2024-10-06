const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SubTopicCourse = require('./SubTopicCourse');

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
  subTopic_id: {
    type: DataTypes.INTEGER,
    references: {
      model: SubTopicCourse,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Question.belongsTo(SubTopicCourse, { foreignKey: 'subTopic_id' });
module.exports = Question;
