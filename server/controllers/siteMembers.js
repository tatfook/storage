import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const SiteMembers = class extends Controller {
	// 构造函数
	constructor() {
		super();
	}

	// 注册路由
	static getRoutes() {
		this.pathPrefix = "siteMembers";
		const baseRoutes = super.getRoutes();
		const routes = [
		];

		return routes.concat(baseRoutes);
	}
}

export default SiteMembers;
