'use strict';
module.exports = function(sequelize, DataTypes) {
  var Fulfillment = sequelize.define('Fulfillment', {
    CoinbaseTxnId: DataTypes.STRING,
    Amount: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Fulfillment.belongsTo(models.Users, {foreignKey: 'Lender'});
        Fulfillment.belongsTo(models.Users, {foreignKey: 'Borrower'});
      }
    }
  });
  return Fulfillment;
};