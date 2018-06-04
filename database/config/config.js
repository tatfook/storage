const Sequelize = require("sequelize");
const config = require("../../server/.config.js");

const developmentConfig = config.development.database;
const productionConfig = config.production.database;
const testConfig = config.test.database;

module.exports = {
  "development": {
    //"username": "wuxiangan",
    //"password": "wuxiangan",
    //"database": "keepwork",
    //"host": "39.106.11.114",
    "username": developmentConfig.username,
    "password": developmentConfig.password,
    "host": developmentConfig.host,
	"port": developmentConfig.port,
	"database": "keepwork-dev",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "test": {
    "username": testConfig.username,
    "password": testConfig.password,
    "host": testConfig.host,
	"port": testConfig.port,
    "database": "keepwork-test",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "production": {
    "username": productionConfig.username,
    "password": productionConfig.password,
    "host": productionConfig.host,
	"port": productionConfig.port || 3306,
    "database": "keepwork",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  }
};
