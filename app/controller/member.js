
const joi = require("joi");
const _ = require("lodash");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT,
} = require("../core/consts.js");
const ENTITYS = [ENTITY_TYPE_USER, ENTITY_TYPE_SITE, ENTITY_TYPE_PAGE, ENTITY_TYPE_GROUP, ENTITY_TYPE_PROJECT];
const Controller = require("../core/controller.js");

const Member = class extends Controller {
	get modelName() {
		return "members";
	}

	async index() {
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});

		const list = await this.model.members.getObjectMembers(params.objectId, params.objectType);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const models = {
			[ENTITY_TYPE_PROJECT]: this.model.projects,
			[ENTITY_TYPE_SITE]: this.model.sites,
			[ENTITY_TYPE_GROUP]: this.model.groups,
		};
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
			memberId: 'int',
		});
		params.userId = userId;

		let data = await models[params.objectType].getById(params.objectId, userId);
		if (!data) return this.throw(400);

		data = await this.model.members.create(params);

		return this.success(data);
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const member = await this.model.members.findOne({where:{id, userId}});
		if (!member) return this.throw(404);

		await this.model.members.destroy({where:{id, userId}});

		await this.model.applies.destroy({where:{objectId:member.objectId, objectType:member.objectType, userId: member.memberId}});

		return this.success("OK");
	}

	async exist() {
		const {userId} = this.authenticated();
		const {objectId, objectType, memberId=userId} = this.validate({
			memberId:"int_optional",
			objectId:'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});
		
		const data = await this.model.members.findOne({where: {
			objectId,objectType, memberId,
		}});

		if (!data) return this.success(false);

		return this.success(true);
	}
}

module.exports = Member;
