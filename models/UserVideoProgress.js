const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
const SubTopicCourse = require('./SubTopicCourse')

const UserVideoProgress = sequelize.define('UserVideoProgress', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // ชื่อโมเดลผู้ใช้ที่คุณมี
      key: 'id',
    },
  },
  subtopic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SubTopicCourse, // ชื่อโมเดล subtopics ที่คุณมี
      key: 'id',
    },
  },
  last_watched_time: {
    type: DataTypes.FLOAT, // เก็บเวลาเป็นวินาที
    allowNull: false,
  },
  is_finished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
});


UserVideoProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' ,onDelete: 'CASCADE' });
UserVideoProgress.belongsTo(SubTopicCourse, { foreignKey: 'subtopic_id',as: 'subTopic' ,onDelete: 'CASCADE' });

module.exports = UserVideoProgress;
