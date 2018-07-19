import _ from "lodash";

import secretConfig from "@/.config.js";

const ENV = secretConfig.ENV || process.env.NODE_ENV;

const defaultConfig = {
	tokenExpire: 3600 * 24 * 100,

	urlPrefix: "note",
	pageSuffix:".md",
	
	host: "0.0.0.0",
	port: 8081,
	domain: "api.keepwork.com",
	origin: "http://api.keepwork.com",
	baseUrl: "/core/v0/",  // 前端baseurl
	apiBaseUrl: "/v0/",    // 后端baseurl

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

	pingpp: {
		key:'',
		privateKey:"",
		pingppPublicKey:"",
		appId: "app_vTe5KO94GiL8nnfT",
	},

	oauths: {
		github: {
			clientId: "5cc0cf681e677a56771b",
		},
		qq: {
			clientId:"101403344",
		},
		weixin: {
			clientId: "wxc97e44ce7c18725e",
		},
		xinlang: {
			clientId: "2411934420",
		},
		facebook: {
			clientId: "1942795522419535",
			clientSecret: "1f7bc8761f32b2c8a0923ecc5ebc8b5e",
			redirectUri: 'https://wxa.keepwork.com/api/wiki/auth/facebook',
			authorizationEndpoint: 'https://www.facebook.com/v3.0/dialog/oauth',
		},
	},
}

const productionConfig = {
	origin: "http://api.keepwork.com",
	//keepworkBaseURL: "http://keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.6:8000/api/wiki/models/",
	qiniu: {
		bucketName: "keepwork",
		bucketDomian: "http://ov62qege8.bkt.clouddn.com",
	},
	database: {
		database:"keepwork",
	}
}

const releaseConfig = {
	origin: "http://api-release.keepwork.com",
	//keepworkBaseURL: "http://release.keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.2:8088/api/wiki/models/",
	database: {
		database:"keepwork-rls",
	}
}
const developmentConfig = {
	origin: "http://api-stage.keepwork.com",
	//keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
	database: {
		database:"keepwork-dev",
	}
}

const localConfig = {
	origin: "http://api-stage.keepwork.com",
	//keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
	database: {
		database:"keepwork-dev",
	}
}

const testConfig = {

}

const configs = {
	"production": _.merge({}, defaultConfig, productionConfig, secretConfig),
	"release": _.merge({}, defaultConfig, releaseConfig, secretConfig),
	"development": _.merge({}, defaultConfig, developmentConfig, secretConfig),
	"local": _.merge({}, defaultConfig, localConfig, secretConfig),
	"test": _.merge({}, defaultConfig, testConfig, secretConfig),
}

console.log(ENV);

export default configs[ENV];
