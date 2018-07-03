import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";

const groupsModel = models["groups"];
const groupMembersModel = models["groupMembers"];

const USER_ACCESS_LEVEL_NONE = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_NONE;
const USER_ACCESS_LEVEL_READ = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_READ;
const USER_ACCESS_LEVEL_WRITE = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_WRITE;

export const Groups = class extends Controller {
	constructor() {
		super();
	}

	async delete(ctx) {
		const userId = ctx.state.user.userId;
		const id = ctx.params.id;

		const data = await this.model.findOne({where:{userId, id}});
		if (!data) return ERR.ERR_PARAMS();
		
		const groupMembersModel = models["groupMembers"];
		await groupMembersModel.delete({where:{groupId:id}});
		
		const siteGroupsModel = models["siteGroups"];
		siteGroupsModel.delete({where:{groupId:id}});

		return ERR.ERR_OK();
	}

	static getRoutes() {
		this.pathPrefix = "groups";
		const baseRoutes = super.getRoutes();
		const routes = [
		];

		return routes.concat(baseRoutes);
	}
}

export default Groups;
