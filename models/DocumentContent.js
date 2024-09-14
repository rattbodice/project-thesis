const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DocumentSubtopic = require('./DocumentSubtopic');

const DocumentContent = sequelize.define('DocumentContent', {
  content_type: {
    type: DataTypes.ENUM('article', 'image'),
    allowNull: false,
  },
  content_text: {
    type: DataTypes.TEXT,
  },
  image_url: {
    type: DataTypes.STRING,
  },
  subtopic_id: {
    type: DataTypes.INTEGER,
    references: {
      model: DocumentSubtopic,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

DocumentContent.belongsTo(DocumentSubtopic, { foreignKey: 'subtopic_id' });
module.exports = DocumentContent;
