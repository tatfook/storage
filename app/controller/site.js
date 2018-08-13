
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const consts = require("../core/consts.js");

const {
	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} = consts;

const Site = class extends Controller {
	get modelName() {
		return "sites";
	}

	async index() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			owned: "boolean_optional", 
			membership: "boolean_optional",
		});

		let list = [];
		params.owned = params.owned == undefined ? true : false;
		if (params.owned) list = list.concat(await this.model.sites.get(userId));
		if (params.membership) list = list.concat(await this.model.sites.getJoinSites(userId, USER_ACCESS_LEVEL_WRITE));

		return this.success(list);
	}

	async create() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			"sitename":"string",
		});

		params.userId = userId;
		let data = await model.sites.findOne({
			where: {
				userId:userId,
				sitename: params.sitename,	
			}
		});
		
		if (data) return ctx.throw(400, "站点已存在");

		data = await model.sites.create(params);	
		if (!data) return ctx.throw(500);
		data = data.get({plain:true});

		//this.addNotification(userId, data.id, "create");

		return this.success(data);
	}

	async getJoinSites() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;

		const list = await model.sites.getJoinSites(userId);

		return this.success(list);
	}

	async postGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
			level: joi.number().valid(USER_ACCESS_LEVEL_NONE, USER_ACCESS_LEVEL_READ, USER_ACCESS_LEVEL_WRITE),
		});
		
		const site = await this.model.sites.getById(params.id, userId);
		if (!site) this.throw(400, "用户站点不存在");
		const group = await this.model.groups.getById(params.groupId, userId);
		if (!group) this.throw(400, "用户组不存在");

		let data = await this.model.siteGroups.create({
			userId,
			siteId: params.id,
			groupId: params.groupId,
			level: params.level,
		});
		if (!data) this.throw(500, "DB Error");
		
		this.success(data.get({plain:true}));
	}

	async putGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
			level: joi.number().valid(USER_ACCESS_LEVEL_NONE, USER_ACCESS_LEVEL_READ, USER_ACCESS_LEVEL_WRITE),
		});

		const where = {
			userId,
			siteId: params.id,
			groupId: params.groupId,
		}
		let data = await this.model.siteGroups.update({level: params.level}, {where});

		this.success(data);
	}

	async deleteGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
		});

		let data = await this.model.siteGroups.destroy({where:{
			userId,
			siteId: params.id,
			groupId: params.groupId,
		}});

		this.success(data);
	}

	async getGroups() {
		const userId = this.authenticated().userId;
		const siteId = this.validate({id: "int"}).id;

		const list = await this.model.sites.getSiteGroups(userId, siteId);

		return this.success(list);
	}
}

module.exports = Site;
