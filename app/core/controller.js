const joi = require("joi");
const _ = require("lodash");
const Controller = require("egg").Controller;

const rules = {
	"int": joi.number().required(),
	"int_optional": joi.number(),
	"number": joi.number().required(),
	"number_optional": joi.number(),
	"string": joi.string().required(),
	"string_optional": joi.string(),
	"boolean": joi.boolean().required(),
	"boolean_optional": joi.boolean(),
}

class BaseController extends Controller {
	//constructor() {
		//super();
	//}

	get model() {
		return this.app.model;
	}

	//get config() {
		//return this.app.config.self;
	//}

	get axios() {
		return this.app.axios;
	}

	get util() {
		return this.app.util;
	}

	get consts() {
		return this.app.consts;
	}

	getParams() {
		return _.merge({}, this.ctx.request.body, this.ctx.query, this.ctx.params);
	}

	validate(schema = {}, options = {allowUnknown:true}) {
		const params = this.getParams();

		_.each(schema, (val, key) => {
			schema[key] = rules[val] || val;
		});

		const result = joi.validate(params, schema, options);

		if (result.error) {
			const errmsg = result.error.details[0].message.replace(/"/g, '');
			console.log(params);
			this.ctx.throw(400, "invalid params:" + errmsg);
		}

		_.assignIn(params, result.value);

		return params;
	}

	getUser() {
		return this.ctx.state.user || {};
	}

	authenticated() {
		const user = this.getUser();
		if (!user || !user.userId) this.ctx.throw(401);

		return user;
	}

	success(body = "OK", status=200) {
		this.ctx.status = status;
		this.ctx.body = body;
	}

	throw(...args) {
		return this.ctx.throw(...args);
	}

	async index() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];

		const list = await model.findAll({where:{userId}});

		return this.success(list);
	}

	async show() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate({"id":"int"});
		const id = params.id;

		const data = await model.findOne({where:{id, userId}});

		return this.success(data);
	}

	async update() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate({"id":"int"});
		const id = params.id;

		delete params.userId;

		const data = await model.update(params, {where:{id, userId}});

		return this.success(data);
	}

	async destroy() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate({"id":"int"});
		const id = params.id;

		const data = await model.destroy({where:{id, userId}});

		return this.success(data);
	}

	async create() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate();

		params.userId = userId;

		const data = await model.create(params);

		return this.success(data);
	}

	async upsert() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate();

		params.userId = userId;

		const data = await model.upsert(params);

		return this.success(data);
	}
}

module.exports = BaseController;
