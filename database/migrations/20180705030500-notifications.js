'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('notifications', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {  // 文件所属者
				type: Sequelize.BIGINT,
				allowNull:  false,
			},

			type: {
				type: Sequelize.INTEGER,
			},

			state: {
				type: Sequelize.INTEGER,
			},

			description: {
				type: Sequelize.TEXT,
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
		return queryInterface.dropTable('notifications');
	}
};
