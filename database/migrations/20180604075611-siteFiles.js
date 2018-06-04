'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('siteFiles', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			key: {       // 文件ID
				type: Sequelize.STRING(256),
				allowNull: false,
			},

			username: {  // 文件使用位置的的用户名
				type: Sequelize.STRING(48),
				allowNull: false,
			},

			sitename: {  // 文件使用位置的站点名
				type: Sequelize.STRING(64),
				allowNull: false,
			},

		}, {
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',

			indexes: [
			{
				unique: true,
				fields: ["key", "username", "sitename"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
	}
};
