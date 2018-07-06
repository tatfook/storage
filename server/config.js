import _ from "lodash";

import commonConfigs from "@@/common/config.js";
import secretConfig from "@/.config.js";

const ENV = secretConfig.ENV || process.env.NODE_ENV;

const commonConfig = commonConfigs[ENV];

const defaultConfig = {
	tokenExpire: 3600 * 24 * 100,

	host: "0.0.0.0",
	port: 7654,
	domain: "api.keepwork.com",
	origin: "http://api.keepwork.com",
	baseUrl: "/core/v0/",

	database: {
		port: 23306,
		host: '10.28.18.16',
		type: "mysql",
		username: "root",
		password: "", 
	},

	gitlab: {
		token: "",
	},

	qiniu: {
		accessKey:"",
		secretKey:"",
		bucketName: "keepwork-dev",
		bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
	},

	email: {
		host: "smtp.exmail.qq.com",
		port: 587,
		user: "noreply@mail.keepwork.com",
		pass: "",
		from: "noreply@mail.keepwork.com",
	},

	sms: {
		serverIP: "app.cloopen.com",
		serverPort: "8883",
		softVersion: "2013-12-26",
		appId: "8a216da85d158d1b015d5a30365c1bfe",
		accountSid: "8a216da85cce7c54015ce86f168408f1",
		accountToken: "",
	},

}

const productionConfig = {
	keepworkBaseURL: "http://keepwork.com/api/wiki/models/",
	origin: "http://api.keepwork.com",
	qiniu: {
		bucketName: "keepwork",
		bucketDomian: "http://ov62qege8.bkt.clouddn.com",
	},
	database: {
		database:"keepwork",
	}
}

const developmentConfig = {
	origin: "http://api-stage.keepwork.com",
	keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	qiniu: {
		bucketName: "keepwork-dev",
		bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
	},
	database: {
		database:"keepwork-dev",
	}
}

const localConfig = {
	origin: "http://localhost:7654",
	keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	qiniu: {
		bucketName: "keepwork-dev",
		bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
	},
	database: {
		database:"keepwork-dev",
	}
}

const testConfig = {

}

const configs = {
	"production": _.merge({}, commonConfig, defaultConfig, productionConfig, secretConfig),
	"development": _.merge({}, commonConfig, defaultConfig, developmentConfig, secretConfig),
	"local": _.merge({}, commonConfig, defaultConfig, localConfig, secretConfig),
	"test": _.merge({}, commonConfig, defaultConfig, testConfig, secretConfig),
}

console.log(ENV);

export default configs[ENV];
