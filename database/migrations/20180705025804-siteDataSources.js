'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('siteDataSources', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			
			siteId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
				
			dataSourceId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			projectId: {
				type: Sequelize.INTEGER,
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
			indexes: [
			{
				unique: true,
				fields: ["userId", "siteId"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('siteDataSources');
	}
};
