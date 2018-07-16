'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("siteGroups", [
		{
			userId:1,
			siteId:1,
			groupId:1,
			level:40,
		},
		{
			userId:1,
			siteId:1,
			groupId:2,
			level:30,
		},
		], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('siteGroups', null, {});
    }
};
