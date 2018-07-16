'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('sites', {
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			sitename: {
				type: Sequelize.STRING(48),
				allowNull: false,
			},

			visibility: {
				type: Sequelize.INTEGER, // public private
				defaultValue: 0,
			},

			description: {
				type: Sequelize.STRING(128),
			},

			createdAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},

			updatedAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		}, {
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
			indexes: [
			{
				unique: true,
				fields: ["userId", "sitename"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('sites');
	}
};

