import Model from "./model.js";

export const Domains = class extends Model {
	constructor() {
		super();
	}

	async getByDomain(domain) {
		const models = g_app.models;
		const usersModel = models["users"];
		const sitesModel = models["sites"];

		let data = await this.model.findOne({where:{domain:domain}});
		if (!data) return ;

		data = data.get({plain:true});

		let site = await sitesModel.findOne({where:{id:data.siteId}});
		if (site) site = site.get({plain:true});

		let user = await usersModel.findOne({where:{id:site.userId}});
		if (user) user = user.get({plain:true});


		return {user, site};
	}

}

export default new Domains();
