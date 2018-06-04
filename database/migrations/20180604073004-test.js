'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('test', { 
			id: Sequelize.INTEGER 
		});
	},

	down: (queryInterface, Sequelize) => {
	}
};
