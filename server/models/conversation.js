'use strict';
module.exports = function(sequelize, DataTypes) {
  var conversation = sequelize.define('Conversation', {
    User1: DataTypes.STRING,
    User2: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        
      }
    }
  });
  return conversation;
};