const Sequelize = require("sequelize");
const config = require("../../server/.config.js");

const configs = config.configs;

const developmentConfig = configs.development.database;
const productionConfig = configs.production.database;
const releaseConfig = configs.release.database;

module.exports = {
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
  }
};

