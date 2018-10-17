'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('pages', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: Sequelize.BIGINT,
			},

			siteId: {
				type: Sequelize.BIGINT,
			},

			key: {
				type: Sequelize.STRING(128),
				allowNull: false,
				unique: true,
			},

			folder: {
				type: Sequelize.STRING(128),
				allowNull: false,
			},
			
			hash: {
				type: Sequelize.STRING(64),
			},
			
			content: {
				type: Sequelize.TEXT('long'),
				//defaultValue: "",
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
		return queryInterface.dropTable('pages');
	}
};
