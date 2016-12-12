'use strict';
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    Text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TimeSent: DataTypes.DATE,
    ConversationId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Message.belongsTo(models.Users, {foreignKey: 'SenderName'});
        Message.belongsTo(models.Users, {foreignKey: 'ReceiverName'});
        Message.belongsTo(models.Conversation);
      }
    }
  });
  return Message;
};