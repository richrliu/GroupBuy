'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Loans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CompletionStatus: {
        type: Sequelize.STRING,
        defaultValue: "pending_approval"
      },
      Amount: {
        type: Sequelize.FLOAT
      },
      FinalAmount: {
        type: Sequelize.FLOAT
      },
      ExpectedEndDate: {
        type: Sequelize.DATE
      },
      InterestRate: {
        type: Sequelize.FLOAT
      },
      AmountRemaining: {
        type: Sequelize.FLOAT
      },
      Lender: {
        type: Sequelize.STRING
      },
      Receiver: {
        type: Sequelize.STRING
      },
      Loan_CoinbaseTxnId: {
        type: Sequelize.STRING
      },
      Fulfillment_CoinbaseTxnId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Loans');
  }
};