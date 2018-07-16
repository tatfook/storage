'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('groups', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			groupname: {
				type: Sequelize.STRING(48),
				allowNull: false,
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
				fields: ["userId", "groupname"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('groups');
	}
};
