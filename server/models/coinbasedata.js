'use strict';
module.exports = function(sequelize, DataTypes) {
  var CoinbaseData = sequelize.define('CoinbaseData', {
    Username: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    AccessToken: DataTypes.STRING,
    RefreshToken: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return CoinbaseData;
};