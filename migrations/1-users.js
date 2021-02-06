'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'active'
      },
      is_social_account: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      total_projects: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      modified_on: {
        type: Sequelize.DATE
      },
      last_login: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      image: {
        type: Sequelize.STRING,
        defaultValue: '/upload/default-user.png'
      },
      assigned_project_id: {
        type: Sequelize.INTEGER
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};