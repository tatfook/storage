
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		this.app.logger.debug("hello world", {key:1});
		this.ctx.logger.debug("this is a test", {key:1});
		this.ctx.status = 200;
		this.ctx.body = "hello world";
	}
}

module.exports = Index;
