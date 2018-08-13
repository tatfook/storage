const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const GroupMember = class extends Controller {
	get modelName() {
		return "groupMembers";
	}
}

module.exports = GroupMember;
