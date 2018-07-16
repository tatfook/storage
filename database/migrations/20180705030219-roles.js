'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('roles', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {  // 文件所属者
				type: Sequelize.BIGINT,
				allowNull:  false,
			},

			roleId: {
				type: Sequelize.INTEGER,
			},

			description: {
				type: Sequelize.STRING(128),
			},

			startTime: {
				type: Sequelize.DATE,
			},

			endTime: {
				type: Sequelize.DATE,
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
				fields: ["userId", "roleId"],
			},
			],
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('roles');
	}
};
