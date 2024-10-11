const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const SubTopicCourse = require('./SubTopicCourse');

const UserSubTopicCourse = sequelize.define('UserSubTopicCourse', {
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  subtopic_id: {
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

User.belongsToMany(SubTopicCourse, { through: UserSubTopicCourse, foreignKey: 'user_id' });
SubTopicCourse.belongsToMany(User, { through: UserSubTopicCourse, foreignKey: 'subtopic_id' });

module.exports = UserSubTopicCourse;
