'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('proposals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AcceptedStatus: {
        type: Sequelize.BOOLEAN
      },
      SenderID: {
        type: Sequelize.STRING
      },
      ReceiverID: {
        type: Sequelize.STRING
      },
      CreationTime: {
        type: Sequelize.DATE
      },
      Amount: {
        type: Sequelize.FLOAT
      },
      ExpectedEndDate: {
        type: Sequelize.DATE
      },
      InterestRate: {
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable('proposals');
  }
};