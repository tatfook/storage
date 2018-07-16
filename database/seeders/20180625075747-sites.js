'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("sites", [
		{
			userId:1,
			sitename: "xiaoyao",
		},
		{
			userId:1,
			sitename: "keepwork",
	   	},
		{
			userId:1,
			sitename: "note",
		},
		], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('sites', null, {});
    }
};
