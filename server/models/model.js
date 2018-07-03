import _ from "lodash";

import Sequelize from 'sequelize';
import sequelize from "./database.js";

import models from "./models.js";

class Model {
	static filterWhere(where = {}) {
		for (let key in where) {
			if (where[key] == undefined) {
				delete where[key];
			}
		}
	}

	wrapOptions(options) {
		Model.filterWhere(options.where);
		options.attributes = options.attributes || {};
		options.attributes.exclude = options.attributes.exclude || this.exclude;
	}

	constructor() {
		this.modelName = _.camelCase(this.constructor.name);
		this.models = models;
	}

	get model() {
		return models[this.modelName];
	}


	async create(...args) {
		return await this.model.create(...args);
	}

	async delete(...args) {
		return await this.model.destroy(...args);
	}

	async destroy(...args) {
		return await this.model.destroy(...args);
	}

	async update(...args) {
		return await this.model.update(...args);
	}

	async find(options) {
		this.wrapOptions(options);
		
		return await this.model.findAll(options);	
	}

	async findAll(options) {
		this.wrapOptions(options);
		return await this.model.findAll(options);	
	}

	async findAndCount(options) {
		this.wrapOptions(options);
		return await this.model.findAndCount(options);	
	}

	async findOne(options) {
		this.wrapOptions(options);
		return await this.model.findOne(options);	
	}

	async upsert(...args) {
		return await this.model.upsert(...args);	
	}

	async query(sql, options) {
		options = options || {};
		options.type = options.type || sequelize.QueryTypes.SELECT;
		return await sequelize.query(sql, options);
	}
}

export default Model;
