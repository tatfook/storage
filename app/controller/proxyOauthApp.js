
const _ = require("lodash");
const Controller = require("../core/controller.js");

const ProxyOauthApp = class extends Controller {

	async agreeOauth() {
		const {userId} = this.authenticated();
		const params = this.validate({"client_id": "string"});

		const code = _.random(1000000, 9999999);
		await this.model.caches.set(`oauth_code_${code}`, {userId}, 1000 * 60 * 10);

		return this.success({error:{id:0, message:"OK"}, data:{code, state:params.state}});
	}

	async getTokenByCode() {
		

	}

}

module.exports = ProxyOauthApp;
