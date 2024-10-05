const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');


const TopicCourse = sequelize.define('TopicCourse', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Course,
      key: 'id',
    },
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  no: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  
}, {
  timestamps: true,
});

TopicCourse.belongsTo(Course, { foreignKey: 'course_id' });

module.exports = TopicCourse;
