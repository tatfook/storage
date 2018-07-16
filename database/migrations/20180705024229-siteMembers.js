'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('siteMembers', { 
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

			memberId: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			level: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
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
				fields: ["siteId", "memberId"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('siteMembers');
	}
};
