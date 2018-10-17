const Sequelize = require("sequelize");

const productionConfig = {
	host: '10.28.18.4',
	port: 3306,
	username: "root",
	password: "root", 

}
const productionEnConfig = {
	host: '10.28.18.4',
	port: 3306,
	username: "root",
	password: "root", 
}

const developmentConfig = {
	host: '10.28.18.16',
	port: "32000",
	username: "root",
	password: "root",
}

const releaseConfig = developmentConfig;

module.exports = {
  "test": {
    "username": developmentConfig.username,
    "password": developmentConfig.password,
    "host": developmentConfig.host,
	"port": developmentConfig.port,
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
  }
};

