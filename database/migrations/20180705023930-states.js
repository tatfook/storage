'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('states', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
				unique: true,
				allowNull: false,
			},

			state: {
				type:Sequelize.INTEGER,
			},

			type: {
				type:Sequelize.INTEGER,
			},

			description: {
				type: Sequelize.STRING(128),
			},

			startDate: {
				type:Sequelize.INTEGER,
			},

			endDate: {
				type:Sequelize.INTEGER,
			},
			
			createdAt: {
				type: Sequelize.DATE
			},

			updatedAt: {
				type: Sequelize.DATE
			},
		}, {
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('states');
	}
};
