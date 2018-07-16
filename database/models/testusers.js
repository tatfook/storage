'use strict';
module.exports = (sequelize, DataTypes) => {
  var testUsers = sequelize.define('testUsers', {
    username: DataTypes.STRING
  }, {});
  testUsers.associate = function(models) {
    // associations can be defined here
  };
  return testUsers;
};