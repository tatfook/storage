'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('users', { 
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			username: {
				type: Sequelize.STRING(48),
				unique: true,
				allowNull: false,
			},

			password: {
				type: Sequelize.STRING(48),
				//set(val) {
					//this.setDataValue("password", md5(val));
				//},
			},

			email: {
				type: Sequelize.STRING(24),
				unique: true,
			},

			cellphone: {
				type: Sequelize.STRING(24),
				unique: true,
			},

			nickname: {
				type: Sequelize.STRING(48),
			},

			portrait: {
				type: Sequelize.STRING(128),
			},

			sex: {
				type: Sequelize.STRING(4),
			},

			description: {
				type: Sequelize.STRING(128),
			},

			createdAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},

			updatedAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		}, {
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('users');
	}
};
