const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TopicCourse = require('./TopicCourse');

const SubTopicCourse = sequelize.define('SubTopicCourse', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  topic_course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: TopicCourse,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

SubTopicCourse.belongsTo(TopicCourse, { foreignKey: 'topic_course_id' });
module.exports = SubTopicCourse;
