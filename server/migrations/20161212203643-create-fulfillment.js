'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Fulfillments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Lender: {
        type: Sequelize.STRING
      },
      Borrower: {
        type: Sequelize.STRING
      },
      CoinbaseTxnId: {
        type: Sequelize.STRING
      },
      Amount: {
        type: Sequelize.FLOAT
      },
      LoanID: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Fulfillments');
  }
};