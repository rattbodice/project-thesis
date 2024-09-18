const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DocumentSubtopic = require('./DocumentSubtopic');
const TypeOrderContent = require('./TypeOrderContent');

const DocumentContent = sequelize.define('DocumentContent', {

  type_order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: TypeOrderContent,
      key: 'id',
    },
  },
  order: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
});

DocumentContent.belongsTo(DocumentSubtopic, { foreignKey: 'subtopic_id' });
module.exports = DocumentContent;
