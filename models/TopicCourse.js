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
  in_form: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Course.belongsTo(User, { foreignKey: 'created_by' });
module.exports = Course;
