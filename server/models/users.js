'use strict';
module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('Users', {
    Username: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    Password: DataTypes.STRING,
    Ranking: DataTypes.DECIMAL
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Users.hasOne(models.Profile);
        Users.hasOne(models.VenmoAccount);
        Users.hasMany(models.Loan);
        Users.hasMany(models.Negotiation);
        Users.hasMany(models.Message);
      }
    }
  });
  return Users;
};