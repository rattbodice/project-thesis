const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');

const Path = sequelize.define('Path', {
  path_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Course,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Path.belongsTo(Course, { foreignKey: 'course_id' });
module.exports = Path;
