'use strict';
module.exports = function(sequelize, DataTypes) {
  var Profile = sequelize.define('Profile', {
    UserUsername: {
      type: DataTypes.STRING,
      defaultValue: "",
      primaryKey: true
    },
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
      defaultValue: "/images/default-user.png"
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
