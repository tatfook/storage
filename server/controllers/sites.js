import joi from "joi";
import _ from "lodash";

import models from "@/models/index.js";
import Controller from "@/controllers/controller.js";
import ERR from "@@/common/error.js";
import {
	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} from "@@/common/consts.js";

export const Sites = class extends Controller {
	constructor() {
		super();
	}

	async addNotification(userId, siteId, oper) {
		const usersModel = models["users"];
		const sitesModel = models["sites"];
		const notificationsModel = models["notifications"];

		let user = await usersModel.getByUserId(userId);
		user = user.getData();

		let site = await sitesModel.getBySiteId(siteId);
		site = site.getData();

		if (oper == "create") oper = "创建";
		if (oper == "update") oper = "更新";
		if (oper == "delete") oper = "删除";
		const description = `${user.nickname || user.username}[${user.username}]${oper}站点${site.sitename}`;
		//console.log(description);
		const result = await notificationsModel.addNotification(userId, description);
		console.log(result);
	}

	async create(ctx) {
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		params.userId = userId;
		params.visibility = ENTITY_VISIBILITY_PUBLIC;

		let data = await this.model.findOne({
			where: {
				userId:userId,
				sitename: params.sitename,	
			}
		});
		
		if (data) return ERR.ERR().setMessage("站点已存在");

		data = await this.model.create(params);	
		if (!data) return ERR.ERR();

		data = data.get({plain:true});

		this.addNotification(userId, data.id, "create");

		return ERR.ERR_OK().setData(data);
	}

	async update(ctx) {
		const id = ctx.params.id;
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		delete params.sitename;

		const result = await this.model.update(params, {where:{id, userId}});
		
		this.addNotification(userId, id, "update");

		return ERR.ERR_OK(result);
	}

	async delete(ctx) {
		const id = ctx.params.id;
		const userId = ctx.state.user.userId;

		let result = await this.model.destroy({
			where: {
				userId,
				id,
			}
		});

		this.addNotification(userId, id, "delete");

		return ERR.ERR_OK(result);
	}

	// 获取站点成员的访问权
	async getSiteMemberLevel(ctx) {
		const id = ctx.params.id;
		const params = ctx.state.params;
		const memberId = params.memberId;

		const level = await this.model.getMemberLevel({siteId:id, memberId:memberId});

		return ERR.ERR_OK(level);
	}

	async getJoinSites(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const level = params.level || USER_ACCESS_LEVEL_NONE;

		const sql = `select sites.*, users.username
			from sites, siteGroups, groupMembers, users 
			where sites.id = siteGroups.siteId and siteGroups.groupId = groupMembers.groupId and sites.userId = users.id
			and groupMembers.memberId = :memberId and siteGroups.level >= :level`;

		const result = await this.model.query(sql, {
			replacements: {
				memberId: userId,
				level: level,
			}
		});

		return ERR.ERR_OK(result);
	}

	async search(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const where = {visibility:ENTITY_VISIBILITY_PUBLIC};

		// 用户ID过滤
		if (params.userId){
			if (params.userId == userId) {
				delete where.visibility;
			}
			where.userId = userId;
		} 

		if (params.sitename) where.sitename = sitename;

		const list = await this.model.findAll({where});

		return ERR.ERR_OK(list);
	}

	async getByName(ctx) {
		const usersModel = models["users"];
		const sitesModel = models["sites"];
		const params = ctx.state.params;
		
		let user = await usersModel.findOne({where:{username: params.username}});
		if (!user) return ERR.ERR_PARAMS();

		let site = await sitesModel.findOne({where: {
			userId: user.id,
			sitename: params.sitename,
		}});
		if (!site) return ERR.ERR_PARAMS();

		if (!await this.model.isReadableByMemberId(site.id, ctx.state.user.userId)) return ERR.ERR_PARAMS();

		return ERR.ERR_OK({user, site});
	}

	static getRoutes() {
		this.pathPrefix = "sites";
		const baseRoutes = super.getRoutes();
		const routes = [
		{
			path:"getByName",
			method: "GET",
			action:"getByName",
			validated: {
				username: joi.string().required(),
				sitename: joi.string().required(),
			},
		},
		{
			path:"search",
			method:"GET",
			action:"search",
			validated: {
				userId: joi.number(),
		   	}
		}, 
		{
			path:"getJoinSites",
			method:"GET",
			action:"getJoinSites",
			authenticated: true,
			validate: {
				query: {
					level:joi.number(),
				},
			},
		}, 
		{
			path:"",
			method:"POST",
			action:"create",
			authenticated: true,
			validate: {
				body: {
					sitename:joi.string().required(),
				},
			},
		}, 
		{
			path:":id/getSiteMemberLevel",
			method:"GET",
			action:"getSiteMemberLevel",
			validate: {
				params: {
					id:joi.number().required(),
				},
				query: {
					memberId:joi.number().required(),
				},
			},
		}
		];

		//return routes;
		return routes.concat(baseRoutes);
	}
}

export default Sites;

