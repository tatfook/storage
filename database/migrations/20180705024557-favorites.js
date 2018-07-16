'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorites', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			favoriteId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			type: {
				type: Sequelize.INTEGER,
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

			indexes: [
			{
				unique: true,
				fields: ["userId", "favoriteId", "type"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('favorites');
	}
};
