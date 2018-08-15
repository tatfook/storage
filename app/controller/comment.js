const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

const Comment = class extends Controller {
	get modelName() {
		return "comments";
	}

	async create() {
		const userId = this.authenticated().userId;
		const {objectType, objectId, content} = this.validate({
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE, ENTITY_TYPE_PAGE),
			objectId: "int",
			content: "string",
		});

		const data = await this.model.comments.createComment(userId, objectId, objectType, content);
		if (!data) this.throw(400);

		return this.success(data);
	}
}

module.exports = Comment;
