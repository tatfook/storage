import Model from "./model.js";

import ERR from "@@/common/error.js";

export const Users = class extends Model {
	constructor() {
		super();
		this.exclude = ["password"];
	}

	async getByUsername(username) {
		const result = await this.model.findOne({
			where: {username},
			exclude: ["password"],
		});

		if (!result) return ERR.ERR_PARAMS();

		return ERR.ERR_OK(result.get({plain:true}));
	}

	async getByUserId(userId) {
		const result = await this.model.findOne({
			where: {
				id:userId,
			},
			exclude: ["password"],
		});

		if (!result) return ERR.ERR_PARAMS();

		return ERR.ERR_OK(result.get({plain:true}));
	}
}

export default new Users();
