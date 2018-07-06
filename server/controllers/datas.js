import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";
import ERR from "@@/common/error.js";


export const Datas = class extends Controller {
	constructor() {
		super();
	}

	async test(ctx) {
		const params = ctx.state.params;
		await this.model.upsert(params);
	}

	static getRoutes() {
		this.pathPrefix = "datas";
		const baseRoutes = super.getRoutes();
		const routes = [
		{
			path:"test",
			method: "POST",
			action:"test",
		}
		];

		return routes.concat(baseRoutes);
	}
}

export default Datas;
