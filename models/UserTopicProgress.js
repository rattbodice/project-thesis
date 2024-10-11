const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const TopicCourse = require('./TopicCourse');

const UserTopicProgress = sequelize.define('UserTopicProgress', {
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  topic_course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: TopicCourse,
      key: 'id',
    },
    onDelete: 'CASCADE',
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

// สร้างความสัมพันธ์แบบ Many-to-Many
User.belongsToMany(TopicCourse, { through: UserTopicProgress, foreignKey: 'user_id' });
TopicCourse.belongsToMany(User, { through: UserTopicProgress, foreignKey: 'topic_course_id' });

module.exports = UserTopicProgress;
