'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("groups", [
		{
			userId: 1,
			groupname: "group1",
		},
		{
			userId: 1,
			groupname: "group2",
		},
		{
			userId: 1,
			groupname: "group3",
		},
		{
			userId: 2,
			groupname: "group4",
		},
		{
			userId: 2,
			groupname: "group5",
		},
		{
			userId: 2,
			groupname: "group6",
		},
		], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('groups', null, {});
    }
};
