'use strict';
module.exports = function(sequelize, DataTypes) {
  var Profile = sequelize.define('Profile', {
    PictureURL: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    Description: {
      type: DataTypes.STRING,
      defaultValue: ""
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Profile.belongsTo(models.Users);
      }
    }
  });
  return Profile;
};
