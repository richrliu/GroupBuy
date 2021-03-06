'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Profiles', {
      UserUsername: {
        type: Sequelize.STRING,
        defaultValue: "",
        primaryKey: true
      },
      PictureURL: {
        type: Sequelize.STRING,
        defaultValue: "/images/default-user.png"
      },
      Bio: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      First: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      Last: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      PhoneNumber: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      Email: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      Location: {
        type: Sequelize.STRING,
        defaultValue: ""
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
    return queryInterface.dropTable('Profiles');
  }
};
