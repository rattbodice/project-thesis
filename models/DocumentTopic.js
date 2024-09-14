const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Document = require('./Document');

const DocumentTopic = sequelize.define('DocumentTopic', {
  topic_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  topic_description: {
    type: DataTypes.TEXT,
  },
  document_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Document,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

DocumentTopic.belongsTo(Document, { foreignKey: 'document_id' });
module.exports = DocumentTopic;
