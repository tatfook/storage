const cache = require("memory-cache");
const consts = require("./app/core/consts.js");
const util = require("./app/core/util.js");
const sms = require("./app/core/sms.js");
const email = require("./app/core/email.js");

module.exports = app => {
	app.cache = cache;
	app.consts = consts;
	app.util = util;

	sms(app);
	email(app);
}
