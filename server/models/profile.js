'use strict';
module.exports = function(sequelize, DataTypes) {
  var Profile = sequelize.define('Profile', {
    First: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    Last: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    PictureURL: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    Bio: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    Email: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    Location: {
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
