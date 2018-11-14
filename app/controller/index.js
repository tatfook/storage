
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		this.ctx.status = 200;
		this.ctx.body = "hello world";
	}
}

module.exports = Index;
