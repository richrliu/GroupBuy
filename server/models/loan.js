'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    CompletionStatus: {
      type: DataTypes.STRING,
      defaultValue: "pending_approval"
    },
    Amount: DataTypes.FLOAT,
    FinalAmount: DataTypes.FLOAT,
    ExpectedEndDate: DataTypes.DATE,
    InterestRate: DataTypes.FLOAT,
    AmountRemaining: DataTypes.FLOAT,
    Loan_CoinbaseTxnId: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Loan.belongsTo(models.Users, {foreignKey: 'Lender'});
        Loan.belongsTo(models.Users, {foreignKey: 'Receiver'});
      }
    }
  });
  return Loan;
};