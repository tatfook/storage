
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		const {ctx} = this;
		const model = ctx.model.files;

		ctx.status = 200;
		ctx.body = "hello world";
	}
}

module.exports = Index;
