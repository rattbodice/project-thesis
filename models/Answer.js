const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Question = require('./Question');
const User = require('./User'); // สมมุติว่าคุณมีโมเดล User

const Answer = sequelize.define('Answer', {
  selected_option: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Question,
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // เชื่อมโยงกับโมเดล User
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

// สร้างความสัมพันธ์
Answer.belongsTo(Question, { foreignKey: 'question_id' });
Answer.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Answer;