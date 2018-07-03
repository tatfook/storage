import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";

const siteGroupsModel = models["siteGroups"];
const sitesModel = models["sites"];

export const SiteGroups = class extends Controller {
	// 构造函数
	constructor() {
		super();
	}

	async find(ctx) {
		const userId = ctx.state.user.userId;
		const sql = "select siteGroups.id, siteGroups.siteId, siteGroups.groupId, siteGroups.level, groups.groupname from siteGroups, groups where siteGroups.groupId = groups.id and siteGroups.userId = :userId";

		const result = await this.model.query(sql, {
			replacements:{
				userId:userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	// 注册路由
	static getRoutes() {
		this.pathPrefix = "siteGroups";
		const baseRoutes = super.getRoutes();
		const routes = [
		];

		return routes.concat(baseRoutes);
	}
}

export default SiteGroups;
