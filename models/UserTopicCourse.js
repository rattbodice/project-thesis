const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const TopicCourse = require('./TopicCourse');
const SubTopicCourse = require('./SubTopicCourse');

const UserTopicCourse = sequelize.define('UserTopicCourse', {
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
          model: SubTopicCourse,
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      progress: {  // สามารถเพิ่มข้อมูลอื่น ๆ ได้ เช่น progress ของผู้ใช้ในแต่ละ SubTopic
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
}, {
  timestamps: true,
});

// สร้างความสัมพันธ์แบบ Many-to-Many
User.belongsToMany(TopicCourse, { through: UserTopicCourse, foreignKey: 'user_id' });
TopicCourse.belongsToMany(User, { through: UserTopicCourse, foreignKey: 'topic_course_id' });

module.exports = UserTopicCourse;
