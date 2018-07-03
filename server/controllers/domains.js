import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Domains = class extends Controller {
	constructor() {
		super();
	}

	async search(ctx) {
		const params = ctx.state.params;
		const options = {
			limit: params.limit && parseInt(params.limit),
			offset: params.offset && parseInt(params.offset),
			where:{},
		}

		if (params.domain) options.where.domain = params.domain;

		const result = await this.model.findAndCount(options);

		return ERR.ERR_OK(result);
	}

	static getRoutes() {
		this.pathPrefix = "domains";
		const baseRoutes = super.getRoutes();

		const routes = [{
			path:"search",
			method:"GET",
			action:"search",
		}];

		return routes.concat(baseRoutes);
	}
}

export default Domains;
