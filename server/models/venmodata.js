'use strict';
module.exports = function(sequelize, DataTypes) {
  var VenmoData = sequelize.define('VenmoData', {
    AccessToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PhoneNumber: DataTypes.STRING,
    UserID: DataTypes.STRING,
    Email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        VenmoData.belongsTo(models.Users);
      }
    }
  });
  return VenmoData;
};