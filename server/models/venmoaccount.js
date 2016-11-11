'use strict';
module.exports = function(sequelize, DataTypes) {
  var VenmoAccount = sequelize.define('VenmoAccount', {
    VenmoUsername: DataTypes.STRING,
    Password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        VenmoAccount.belongsTo(models.Users);
      }
    }
  });
  return VenmoAccount;
};