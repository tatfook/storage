'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('visitors', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
			},

			entityId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			type: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},

			count: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},

			visitors: {
				type: Sequelize.TEXT,
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
				fields: ["entityId", "type"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('visitors');
	}
};
