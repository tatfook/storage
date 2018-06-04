'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('files', {
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			key: {  // 存储服务的文件名  推荐使用全路径  可以使用UUID 唯一即可
				type: Sequelize.STRING(256),
				unique: true,
			},

			username: {  // 文件所属者
				type: Sequelize.STRING(48),
				allowNull: false,
			},

			sitename: { // 存在 归于站点  不存在归于 用户  用于多人编辑引用站点资源
				type: Sequelize.STRING(64),
			},

			filename: { // 文件名  方便用户识别文件
				type: Sequelize.STRING(64),
			},

			public: {   // 是否公开
				type: Sequelize.BOOLEAN,
				defaultValue: false, 
			},

			type: {     // 文件类型
				type: Sequelize.STRING(12),
			},

			size: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},

			hash: {     // 七牛哈希  文件存于谁就用谁的hash   如 git sha
				type: Sequelize.STRING(64),
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
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('files');
	}
};

