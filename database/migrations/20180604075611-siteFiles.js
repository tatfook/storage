'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('siteFiles', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			fileId: {       // 文件ID
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			userId: {  // 文件使用位置的的用户名
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			siteId: {  // 文件使用位置的站点名
				type: Sequelize.BIGINT,
				allowNull: false,
			},

			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},

			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
		}, {
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',

			indexes: [
			{
				unique: true,
				fields: ["key", "userId", "siteId"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('siteFiles');
	}
};
