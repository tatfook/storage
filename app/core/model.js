import _ from "lodash";
import Sequelize from 'sequelize';

import model from "@/model";

export const Model = class {
	constructor(sequelize) {
		this.sequelize = sequelize;
		this.QueryTypes = sequelize.QueryTypes;
	}

	define(modelName, attributes, options) {
		this[modelName] = this.sequelize.define(modelName, attributes, options);
		return this[modelName];
	}

	async query(sql, options) {
		options = options || {};
		options.type = options.type || this.sequelize.QueryTypes.SELECT;
		return await this.sequelize.query(sql, options);
	}
}

export default app => {
	const config = app.config;
	const dbconfig = config.database;

	app.Sequelize = Sequelize;
	app.sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, {
		port: dbconfig.port,
		host: dbconfig.host,
		dialect: dbconfig.type,
		operatorsAliases: false,

		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000
		},
	});

	app.sequelize.addHook("afterCreate", async(instance, options) => {
		console.log(options);
		instance = instance.get({plain:true});
	});

	app.sequelize.addHook("afterBulkUpdate", async(options) => {
		
	});

	app.sequelize.addHook("beforeBulkDestroy", async(options) => {

	});

	Object.defineProperty(app, "model", {
		value: new Model(app.sequelize),
		writable: false,
		configurable: false,
	});

	model(app);
}
