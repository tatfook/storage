const Sequelize = require("sequelize");
const config = require("../../server/.config.js");

const configs = config.configs;
const developmentConfig = configs.development.database;
const releaseConfig = configs.release.database;
const productionConfig = configs.production.database;
const productionEnConfig = configs["production-en"].database;
const testConfig = configs.test.database;

module.exports = {
  "test": {
    "username": testConfig.username,
    "password": testConfig.password,
    "host": testConfig.host,
	"port": testConfig.port,
    "database": "keepwork-test",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "development": {
    "username": developmentConfig.username,
    "password": developmentConfig.password,
    "host": developmentConfig.host,
	"port": developmentConfig.port,
	"database": "keepwork-dev",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "release": {
    "username": releaseConfig.username,
    "password": releaseConfig.password,
    "host": releaseConfig.host,
	"port": releaseConfig.port,
    "database": "keepwork-rls",
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
  },
  "development-en": {
    "username": developmentConfig.username,
    "password": developmentConfig.password,
    "host": developmentConfig.host,
	"port": developmentConfig.port,
	"database": "keepwork-dev-en",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "release-en": {
    "username": releaseConfig.username,
    "password": releaseConfig.password,
    "host": releaseConfig.host,
	"port": releaseConfig.port,
    "database": "keepwork-rls-en",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
  "production-en": {
    "username": productionEnConfig.username,
    "password": productionEnConfig.password,
    "host": productionEnConfig.host,
	"port": productionEnConfig.port || 3306,
    "database": "keepwork-en",
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op,
  },
};
//console.log(developmentConfig);
