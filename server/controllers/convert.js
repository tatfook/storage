import _ from "lodash";
import joi from "joi";
import axios from "axios";

import config from "@/config.js";
import models from "@/models";
import Controller from "@/controllers/controller.js";
import {
	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

const keepworkApiUrlPrefix = config.keepworkApiUrlPrefix;

export const Convert = class extends Controller {
	constructor() {
		super();
	}

	async convert() {
		await this.users();
		await this.sites();
		await this.groups();
		await this.groupMembers();
		await this.siteGroups();
	}

	async convertUser(data) {
		const usersModel = models["users"];
		let user = {
			id: data._id,
			username: data.username,
			password: data.password,
			nickname: data.displayName,
			sex: data.sex,
			description: data.introduce,
			portrait: data.portrait,
			cellphone: data.cellphone || (data.realNameInfo && data.realNameInfo.cellphone),
		};

		return await usersModel.upsert(user);
	}

	async users() {
		const datas = await axios.get(keepworkApiUrlPrefix + "user/export").then(res => res.data);

		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertUser(data);
		}

		return datas;
	}

	async convertSite(data) {
		const usersModel = models["users"];
		const sitesModel = models["sites"];
		let user = await usersModel.findOne({where:{username:data.username}});
		if (!user) return;
		let site = {
			userId: user.id,
			id: data._id,
			sitename: data.name,
			description: data.desc,
			visibility: data.visibility == "public" ? 0 : 1,
			displayName: data.displayName,
			logoUrl: data.logoUrl,
		};
		return await sitesModel.upsert(site);
	}

	async sites() {
		const datas = await axios.get(keepworkApiUrlPrefix + "website/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertSite(data);
		}

		return datas;
	}

	async convertGroup(data) {
		const usersModel = models["users"];
		const groupsModel = models["groups"];
		let user = await usersModel.findOne({where:{username:data.username}});
		if (!user) return;
		let group = {
			userId: user.id,
			id: data._id,
			groupname: data.groupname,
		};

		return await groupsModel.upsert(group);
	}

	async groups() {
		const datas = await axios.get(keepworkApiUrlPrefix + "group/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertGroup(data);
		}

		return datas;
	}

	async convertGroupMember(data) {
		const usersModel = models["users"];
		const groupsModel = models["groups"];
		const groupMembersModel = models["groupMembers"];

		let user = await usersModel.findOne({where:{username: data.username}});
		let member = await usersModel.findOne({where:{username: data.memberName}});
		if (!user || !member) return;
		let group = await groupsModel.findOne({where: {
			userId: user.id,
			groupname: data.groupname,
		}});
		if (!group) return ;
		let groupMember = {
			id: data._id,
			userId: user.id,
			memberId: member.id,
			groupId: group.id,
		};

		return await groupMembersModel.upsert(groupMember);
	}

	async groupMembers() {
		const datas = await axios.get(keepworkApiUrlPrefix + "group_user/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertGroupMember(data)
		}

		return datas;
	}

	async convertSiteGroup(data) {
		const usersModel = models["users"];
		const sitesModel = models["sites"];
		const groupsModel = models["groups"];
		const siteGroupsModel = models["siteGroups"];

		let user = await usersModel.findOne({where:{username:data.username}});
		let groupUser = await usersModel.findOne({where:{username: data.groupUsername}});
		if (!user || !groupUser) return;
		let site = await sitesModel.findOne({where:{userId:user.id, sitename:data.sitename}});
		let group = await groupsModel.findOne({where: {
			userId: groupUser.id,
			groupname: data.groupname,
		}});
		if (!group || !site) return;
		let siteGroup = {
			id: data._id,
			userId: user.id,
			siteId: site.id,
			groupId: group.id,
			level: data.level > 20 ? USER_ACCESS_LEVEL_WRITE : (data.level > 10 ? USER_ACCESS_LEVEL_READ : USER_ACCESS_LEVEL_NONE),
		};

		await siteGroupsModel.upsert(siteGroup);
	}

	async siteGroups() {
		const datas = await axios.get(keepworkApiUrlPrefix + "site_group/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertSiteGroup(data);
		}

		return datas;
	}

	async data(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const data = params.data;
		if (!data) return ERR.ERR_PARAMS();
		if (params.token != config.token) return ERR.ERR_NO_PERMISSION();

		if (tablename == "users") return await this.convertUser(data);
		if (tablename == "sites") return await this.convertSite(data);
		if (tablename == "groups") return await this.convertGroup(data);
		if (tablename == "groupMembers") return await this.convertGroupMember(data);
		if (tablename == "siteGroups") return await this.convertSiteGroup(data);

		return ERR.ERR_PARAMS();
	}

	async deleteData(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const id = params.id;
		const model = models[tablename];
		if (!model) return ERR.ERR_PARAMS();
		if (params.token != config.token) return ERR.ERR_NO_PERMISSION();

		const result = await model.destroy({where:{id}});

		if (tablename == "groups") {
			const groupMembersModel = models["groupMembers"];
			await groupMembersModel.destroy({where:{groupId:id}});
			const siteGroupsModel = models["siteGroups"];
			await siteGroupsModel.destroy({where:{groupId:id}});
		}

		return ERR.ERR_OK(result);
	}

	static getRoutes() {
		this.pathPrefix = "convert";

		const routes = [
		{
			path: "",
			method:"GET",
			action: "convert",
		},
		{
			path: "data",
			method: "ALL",
			action: "data",
			validated: {
				tablename: joi.string().required(),
				token: joi.string().required(),
			}
		},
		{
			path: "deleteData",
			method: "ALL",
			action: "deleteData",
			validated: {
				tablename: joi.string().required(),
				token: joi.string().required(),
				id: joi.number().required(),
			}
		},
		{
			path: "users",
			method:"GET",
			action: "users",
		},
		{
			path: "sites",
			method:"GET",
			action: "sites",
		},
		{
			path: "groups",
			method:"GET",
			action: "groups",
		},
		{
			path: "groupMembers",
			method:"GET",
			action: "groupMembers",
		},
		{
			path: "siteGroups",
			method:"GET",
			action: "siteGroups",
		},
		];
		
		return routes;
	}
}

export default Convert;
