'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('storages', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			userId: {  // 文件所属者
				type: Sequelize.BIGINT,
				unique: true,
				allowNull: false,
			},

			total: {
				type: Sequelize.BIGINT,
				defaultValue: 2 * 1024 * 1024 * 1024,
			},

			used: {
				type: Sequelize.BIGINT,
				defaultValue: 0,
			},

			fileCount: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
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
		return queryInterface.dropTable('storages');
	}
};
