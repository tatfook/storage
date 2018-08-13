
const Controller = require("../core/controller.js");

class Index extends Controller {
	index() {
		const {ctx} = this;

		ctx.status = 200;
		ctx.body = "hello world";
		console.log(this.super);
	}
}

module.exports = Index;
