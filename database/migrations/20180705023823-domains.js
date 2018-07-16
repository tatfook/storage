'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('domains', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			domain: {
				type: Sequelize.STRING(32),
				unique: true,
				allowNull: false,
			},

			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			siteId: {
				type: Sequelize.BIGINT,
				allowNull: false,
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
		return queryInterface.dropTable('domains');
	}
};
