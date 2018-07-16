'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('users', [
		{
			username: "xiaoyao",
			password: "wuxiangan",
			nickname: "逍遥",
		}, 
		{
			username: "note",
			password: "wuxiangan",
			nickname: "逍遥",
		}, 
		{
			username: "wxatest",
			password: "wuxiangan",
		},
		], {
			ignoreDuplicates: true
		});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', null, {});
    }
};
