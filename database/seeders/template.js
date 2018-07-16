'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("test", [
		{
			//createdAt: new Date(),
		}
		], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('test', null, {});
    }
};
