const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SubTopicCourse = require('./SubTopicCourse');

const Video = sequelize.define('Video', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sub_topic_course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: SubTopicCourse,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Video.belongsTo(SubTopicCourse, { foreignKey: 'sub_topic_course_id' });
module.exports = Video;
