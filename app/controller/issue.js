
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT, // 项目
} = require("../core/consts.js");

const ENTITYS = [ENTITY_TYPE_USER, ENTITY_TYPE_SITE, ENTITY_TYPE_PAGE, ENTITY_TYPE_GROUP, ENTITY_TYPE_PROJECT];

const Issue = class extends Controller {
	get modelName() {
		return "issues";
	}

	async index() {
		const {objectId, objectType} = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});

		const list = await this.model.issues.getObjectIssues(objectId, objectType);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			objectType: joi.number().valid(ENTITYS),
			objectId: "int",
			title: "string",
			content: "string",
		});
		params.userId = userId;

		let data = await this.model.issues.create(params);
		if (!data) return this.throw(500);
		data = data.get({plain:true});

		if (params.tags && _.isArray(params.tags)) {
			await this.model.tags.setObjectTags(data.id, ENTITY_TYPE_ISSUE, params.tags, userId);
		};

		// 指派人
		if (params.assigns && _.isArray(params.assigns)) {
			await this.model.members.setObjectMembers(data.id, ENTITY_TYPE_ISSUE, params.assigns, userId);
		}

		return this.success(data);
	}

	async update() {
		const {userId} = this.authenticated();
		const params = this.validate({id:"int"});
		const id = params.id;

		const ok = await this.model.issues.update(params, {where:{id:params.id, userId}});
		if (!ok || ok[0] != 1) this.throw(400);

		if (params.tags && _.isArray(params.tags)) {
			await this.model.tags.setObjectTags(id, ENTITY_TYPE_ISSUE, params.tags, userId);
		};

		// 指派人
		if (params.assigns && _.isArray(params.assigns)) {
			await this.model.members.setObjectMembers(id, ENTITY_TYPE_ISSUE, params.assigns, userId);
		}
		
		return this.success("OK");
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});
	
		const ok = await this.model.issues.destroy({where:{id:id, userId}});
		if(ok > 0) await this.model.members.destroy({where:{userId, objectType: ENTITY_TYPE_ISSUE,	objectId: id}});

		return this.success();
	}

	async show() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});
		
		const issue = await this.model.issues.getById(id, userId);
		if (!issue) this.throw(400);

		const users = await this.model.members.getObjectMembers(issue.id, ENTITY_TYPE_ISSUE);
		const tags = await this.model.tags.getObjectTags(issue.id, ENTITY_TYPE_ISSUE);
		issue.assigns = users;
		issue.tags = tags;

		return this.success(issue);
	}
}

module.exports = Issue;
