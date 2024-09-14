const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Quiz = require('./Quiz');

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  quiz_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Quiz,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' });
module.exports = QuizQuestion;
