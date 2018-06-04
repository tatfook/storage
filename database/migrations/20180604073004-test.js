'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('test', { 
			id: Sequelize.INTEGER,

			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},

			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('test');
	}
};
