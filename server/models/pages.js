import Model from "./model.js";
import ERR from "@@/common/error.js";

export const Pages = class extends Model {
	constructor() {
		super();
	}

	async getByPageId(pageId) {
		let data = await this.findOne({where:{id:pageId}});
		
		if (!data) return ERR.ERR_NOT_FOUND();

		data = data.get({plain:true});

		return ERR.ERR_OK(data);
	}

	async getByKey(key) {
		let data = await this.findOne({where:{key}});
		
		if (!data) return ERR.ERR_NOT_FOUND();

		data = data.get({plain:true});

		return ERR.ERR_OK(data);
	}
}

export default new Pages();

