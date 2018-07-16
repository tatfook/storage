
import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";


export const Tests = class extends Controller {
	constructor() {
		super();
	}

	async test() {
		return "hello world";
	}

	static getRoutes() {
		this.pathPrefix = "tests";

		const routes = [
		{
			path:"",
			action: "test",
			method: ["GET", "POST"],
		},
		];

		return routes;
	}
}

export default Tests;
