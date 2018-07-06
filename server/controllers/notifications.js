import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";
import ERR from "@@/common/error.js";


export const Notifications = class extends Controller {
	constructor() {
		super();
	}

	async test(ctx) {
		const params = ctx.state.params;
		await this.model.upsert(params);
	}

	static getRoutes() {
		this.pathPrefix = "notifications";
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

export default Notifications;
