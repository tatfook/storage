import _ from "lodash";

import commonConfigs from "@@/common/config.js";
import secretConfig from "@/.config.js";

const ENV = secretConfig.ENV || process.env.NODE_ENV;

const commonConfig = commonConfigs[ENV];

const defaultConfig = {
	tokenExpire: 3600 * 24 * 100,
	database: {
		//port:3306,
		host: '39.106.11.114',
		type: "mysql",
		database: "note", // 数据库名
		username: "wuxiangan",
		password: "", 
	},

	gitlab: {
		token: "",
	},

	qiniu: {
		accessKey:"",
		secretKey:"",
		bucketName: "note",
		bucketDomian: "http://qiniu.wxaxiaoyao.cn",
		// keepwork-dev
		//bucketName: "keepwork-dev",
		//bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
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
}

const developmentConfig = {
}

const localConfig = {
	
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
