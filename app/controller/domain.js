const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Domain = class extends Controller {
	get modelName() {
		return "domains";
	}
}

module.exports = Domain;
