'use strict';
module.exports = function(sequelize, DataTypes) {
  var Proposal = sequelize.define('Proposal', {
    AcceptedStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    SenderID: DataTypes.STRING,
    ReceiverID: DataTypes.STRING,
    CreationTime: DataTypes.DATE,
    Amount: DataTypes.FLOAT,
    ExpectedEndDate: DataTypes.DATE,
    InterestRate: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Proposal.belongsTo(models.Negotiation);
      }
    }
  });
  return Proposal;
};