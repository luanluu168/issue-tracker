'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'open'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(`NOW() + INTERVAL '7 days'`)
      },
      actual_end_date: {
        type: Sequelize.DATE
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: false
      },
      modified_on: {
        type: Sequelize.DATE
      },
      modified_by: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
            as: 'fk_projects_users'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Projects');
  }
};