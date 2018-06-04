const Sequelize = require("sequelize");

module.exports = {
  "development": {
    //"username": "wuxiangan",
    //"password": "wuxiangan",
    //"database": "keepwork",
    //"host": "39.106.11.114",
	"username": "root",
	"password": "123456",
	"database": "keepwork",
	"host": "10.28.18.16",
	"port": 23306,
    "dialect": "mysql",
	"operatorsAliases":Sequelize.Op
  },
  "test": {
    "username": "root",
	"password": "123456",
    "database": "keepwork",
    "host": "10.28.18.16",
	"port": 23306,
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
	"password": "123456",
    "database": "keepwork",
    "host": "10.28.18.16",
	"port": 23306,
    "dialect": "mysql"
  }
};
