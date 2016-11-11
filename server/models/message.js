'use strict';
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    Text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TimeSent: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Message.hasMany(models.Users);
        Message.belongsTo(models.Users, {foreignKey: 'SenderName'});
        Message.belongsTo(models.Users, {foreignKey: 'ReceiverName'});
      }
    }
  });
  return Message;
};