'use strict';
module.exports = function(sequelize, DataTypes) {
  var Negotiation = sequelize.define('Negotiation', {
    AcceptedStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Negotiation.hasMany(models.Proposal);
        Negotiation.hasOne(modles.Loan);
        Negotiation.belongsTo(models.Users, {foreignKey: 'Lender'});
        Negotiation.belongsTo(models.Users, {foreignKey: 'Receiver'});
      }
    }
  });
  return Negotiation;
};