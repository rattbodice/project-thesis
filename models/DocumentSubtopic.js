const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DocumentTopic = require('./DocumentTopic');

const DocumentSubtopic = sequelize.define('DocumentSubtopic', {
  subtopic_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtopic_description: {
    type: DataTypes.TEXT,
  },
  topic_id: {
    type: DataTypes.INTEGER,
    references: {
      model: DocumentTopic,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

DocumentSubtopic.belongsTo(DocumentTopic, { foreignKey: 'topic_id' });
module.exports = DocumentSubtopic;
