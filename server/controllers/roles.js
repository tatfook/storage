
import joi from "joi";

import Controller from "@/controllers/controller.js";

export const Roles = class extends Controller {
	constructor() {
		super();
	}

	static getRoutes() {
		this.pathPrefix = "roles";
		const baseRoutes = super.getRoutes();

		const routes = [
		];

		return routes.concat(baseRoutes);
	}
}

export default Roles;
