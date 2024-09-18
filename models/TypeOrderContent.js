const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TextContent = require('./TextContent');
const ImageContent = require('./ImageContent');
const VideoContent = require('./VideoContent');

const TypeOrderContent = sequelize.define('TypeOrderContent', {

    text_content_id: {
        type: DataTypes.INTEGER,
        references: {
            model: TextContent,
            key: 'id',
        }
    },
    image_content_id: {
        type: DataTypes.INTEGER,
        references: {
            model: ImageContent,
            key: 'id',
        }
    },
    video_content_id: {
        type: DataTypes.INTEGER,
        references: {
            model: VideoContent,
            key: 'id',
        },
    },
}, {
    timestamps: true,
});

TypeOrderContent.belongsTo(TextContent, { foreignKey: 'text_content_id' });
TypeOrderContent.belongsTo(ImageContent, { foreignKey: 'image_content_id' });
TypeOrderContent.belongsTo(VideoContent, { foreignKey: 'video_content_id' });
module.exports = TypeOrderContent;
