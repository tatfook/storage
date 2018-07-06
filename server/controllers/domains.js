import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Domains = class extends Controller {
	constructor() {
		super();
	}

	async getByDomain(ctx) {
		const params = ctx.state.params;
		const data = await this.model.getByDomain(params.domain);

		return ERR.ERR_OK(data);
	}

	static getRoutes() {
		this.pathPrefix = "domains";
		const baseRoutes = super.getRoutes();

		const routes = [
		{
			path:"getByDomain",
			method:"GET",
			action:"getByDomain",
			validated: {
				domain: joi.string().required(),
			},
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default Domains;
