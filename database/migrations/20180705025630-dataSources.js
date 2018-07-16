'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('dataSources', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			name: {
				type: Sequelize.STRING(32),
				allowNull: false,
			},

			type: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},

			token: {
				type: Sequelize.STRING(64),
				allowNull: false,
			},
			
			projectId: {
				type: Sequelize.INTEGER,
			},
			
			host: {
				type: Sequelize.STRING(32),
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
				fields: ["userId", "name"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('dataSources');
	}
};
