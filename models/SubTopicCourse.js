const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TopicCourse = require('./TopicCourse');
const Video = require('./Video');

const SubTopicCourse = sequelize.define('SubTopicCourse', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Video,
      key: 'id',
    },
  },
  topic_course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: TopicCourse,
      key: 'id',
    },
  },
  no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  level: {  // เพิ่ม attribute level ที่นี่
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // ตั้งค่าค่าเริ่มต้นเป็น 1
  },
}, {
  timestamps: true,
});

// สร้างความสัมพันธ์
SubTopicCourse.belongsTo(Video, { foreignKey: 'video_id', as: 'video',onDelete: 'CASCADE' });
SubTopicCourse.belongsTo(TopicCourse, { foreignKey: 'topic_course_id',onDelete: 'CASCADE' });

module.exports = SubTopicCourse;
