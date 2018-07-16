'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("groupMembers", [
		{
			userId:1,
			groupId:1,
			memberId:2,
			level:40,
		},
		{
			userId:1,
			groupId:1,
			memberId:3,
			level:40,
		},
		], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('groupMembers', null, {});
    }
};
