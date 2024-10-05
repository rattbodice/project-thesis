const { DataTypes, INTEGER } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const ImageContent = require('./ImageContent')

const Course = sequelize.define('Course', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_id:{
    type: INTEGER,
    allowNull: true,
    references: {
      model: ImageContent,
      key: 'id'
    }
  },
  level:{
    type: INTEGER,
    allowNull: false
  },
  created_by: {
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
// ใน Course model
Course.belongsTo(ImageContent, { foreignKey: 'image_id', as: 'image' }); // ใช้ alias 'image'

module.exports = Course;
