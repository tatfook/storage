const _ = require("lodash");
const cache = require("memory-cache");
const consts = require("./app/core/consts.js");
const util = require("./app/core/util.js");
const sms = require("./app/core/sms.js");
const email = require("./app/core/email.js");
const axios = require("./app/core/axios.js");
const api = require("./app/core/api.js");

module.exports = app => {
	app.cache = cache;
	app.consts = consts;
	app.util = util;
	app.unittest = app.config.env == "unittest";

	sms(app);
	email(app);
	axios(app);
	api(app);

	//console.log(app.config.env);
}
