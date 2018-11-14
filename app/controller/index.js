
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		const params = this.validate();

		this.formatQuery(params);

		const list = await this.model.worlds.findAll({...this.queryOptions, where:params});

		return this.success(list);

		this.app.runSchedule("log");
		this.ctx.status = 200;
		this.ctx.body = "hello world";
	}
}

module.exports = Index;
