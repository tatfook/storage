
const axios = require("axios");
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} = require("../core/consts.js");

const Convert = class extends Controller {
	get modelName() {
	}

	async convert() {
		await this.users();
		await this.sites();
		await this.groups();
		await this.groupMembers();
		await this.siteGroups();

		return this.success("OK");
	}

	keepworkApiUrlPrefix() {
		return this.app.config.self.keepworkBaseURL;
	}

	async convertUser(data) {
		const usersModel = this.ctx.model.users;
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
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "user/export").then(res => res.data);

		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertUser(data);
		}

		return this.success(datas);
	}

	async convertSite(data) {
		const usersModel = this.ctx.model.users;
		const sitesModel = this.ctx.model.sites;
		let user = await usersModel.findOne({where:{username:data.username}});
		if (!user) return;
		let site = {
			id: data._id,
			userId: user.id,
			sitename: data.name,
			visibility: data.visibility == "public" ? 0 : 1,
			description: data.desc,
			extra: {
				logoUrl: data.logoUrl,
				displayName: data.displayName,
			}
		};
		return await sitesModel.upsert(site);
	}

	async sites() {
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "website/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertSite(data);
		}

		return this.success(datas);
	}

	async convertGroup(data) {
		const usersModel = this.ctx.model.users;
		const groupsModel = this.ctx.model.groups;
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
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "group/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertGroup(data);
		}

		return this.success(datas);
	}

	async convertGroupMember(data) {
		const usersModel = this.ctx.model.users;
		const groupsModel = this.ctx.model.groups;
		const membersModel = this.ctx.model.members;

		let user = await usersModel.findOne({where:{username: data.username}});
		let member = await usersModel.findOne({where:{username: data.memberName}});
		if (!user || !member) return console.log("用户丢失", data);
		let group = await groupsModel.findOne({where: {
			userId: user.id,
			groupname: data.groupname,
		}});
		if (!group) return console.log("组不存在", data);
		let groupMember = {
			id: data._id,
			userId: user.id,
			objectId: member.id,
			objectType: ENTITY_TYPE_GROUP,
			groupId: group.id,
		};

		return await groupMembersModel.upsert(groupMember);
	}

	async groupMembers() {
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "group_user/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertGroupMember(data)
		}

		return this.success(datas);
	}

	async convertSiteGroup(data) {
		const usersModel = this.ctx.model.users;
		const sitesModel = this.ctx.model.sites;
		const groupsModel = this.ctx.model.groups;
		const siteGroupsModel = this.ctx.model.siteGroups;

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
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "site_group/export").then(res => res.data);
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			await this.convertSiteGroup(data);
		}

		return this.success(datas);
	}

	async data(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const data = params.data;
		if (!data) return this.success("PARAMS ERROR");
		if (params.token != config.token) return this.success("NO PERMISSTION");

		if (tablename == "users") return await this.convertUser(data);
		if (tablename == "sites") return await this.convertSite(data);
		if (tablename == "groups") return await this.convertGroup(data);
		if (tablename == "groupMembers") return await this.convertGroupMember(data);
		if (tablename == "siteGroups") return await this.convertSiteGroup(data);

		return this.success("OK");
	}

	async deleteData(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const id = params.id;
		const model = models[tablename];
		if (!model) return this.success("PARAMS ERROR");
		if (params.token != config.token) return this.success("NO PERMISSTION");

		const result = await model.destroy({where:{id}});

		if (tablename == "groups") {
			const groupMembersModel = models["groupMembers"];
			await groupMembersModel.destroy({where:{groupId:id}});
			const siteGroupsModel = models["siteGroups"];
			await siteGroupsModel.destroy({where:{groupId:id}});
		}

		return this.success("OK");
	}
}

module.exports = Convert;
