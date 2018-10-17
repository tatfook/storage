
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

const Tag = class extends Controller {
	get modelName() {
		return "tags";
	}
}

module.exports = Tag;
