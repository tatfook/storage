'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('logs', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			module: {
				type: Sequelize.STRING(32),
			},

			// uid 日志归类
			logId: {  
				type: Sequelize.STRING(64),
			},

			url: {
				type: Sequelize.STRING(128),
			},

			// 类型
			type: {
				type: Sequelize.INTEGER,
			},

			// 日志级别
			level: {
				type: Sequelize.INTEGER,
			},

			// 文件位置
			filepos: {
				type: Sequelize.STRING(128),
			},

			// 日志信息
			message: {
				type: Sequelize.TEXT,
			},

			// data 
			data: {
				type: Sequelize.JSON,
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
		return queryInterface.dropTable('logs');
	}
};
