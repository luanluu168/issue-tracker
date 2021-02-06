'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Issues', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      summary: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
            as: 'fk_issues_users'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id',
            as: 'fk_issues_projects'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(30),
        defaultValue: 'open'
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'normal'
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
      assign_to_another_user_id: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      resolved_date: {
        type: Sequelize.DATE
      },
      actual_resolved_date: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Issues');
  }
};