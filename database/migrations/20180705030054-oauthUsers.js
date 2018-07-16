'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('oauthUsers', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {  // 文件所属者
				type: Sequelize.BIGINT,
			},

			externalId: {
				type: Sequelize.STRING(48),
			},

			externalUsername: {
				type: Sequelize.STRING(48),
			},

			type: {
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
				fields: ["externalId", "type"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('oauthUsers');
	}
};
