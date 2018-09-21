const _ = require("lodash");
const cache = require("memory-cache");
const consts = require("./app/core/consts.js");
const util = require("./app/core/util.js");
const sms = require("./app/core/sms.js");
const email = require("./app/core/email.js");
const axios = require("./app/core/axios.js");
const api = require("./app/core/api.js");
const qiniu = require("./app/core/qiniu.js");
const pingpp = require("./app/core/pingpp.js");

module.exports = app => {
	app.cache = cache;
	app.consts = consts;
	app.util = util;
	app.unittest = app.config.env == "unittest";

	sms(app);
	email(app);
	axios(app);
	api(app);
	qiniu(app);

	//console.log(app.config.env);
	//
	//console.log("----------构建表-----------");
	//app.model.files.sync({force:true});
	//app.model.storages.sync({force:true});
	//app.model.siteFiles.sync({force:true});
}
