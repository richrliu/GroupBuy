'use strict';
module.exports = function(sequelize, DataTypes) {
  var Payment = sequelize.define('Payment', {
    SuccessStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    PaymentTime: DataTypes.DATE,
    Amount: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Payment.belongsTo(models.Loan);
      }
    }
  });
  return Payment;
};