import _ from "lodash";

import secretConfig from "./.config.js";

const defaultConfig = {
	secret: "keepwork",

	apiUrlPrefix: "/v0/",
	baseURL: "/storage/v0/",
	host: "0.0.0.0",
	port: 8088,
	protocol: "http",
	origin: "http://api-stage.keepwork.com",
	//keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",

	database: {
		port: 23306,
		host: '10.28.18.16',
		type: "mysql",
		username: "root",
		password: "", 
		database:"keepwork-dev",
	},

	elasticsearch: {
		baseURL: "http://10.28.18.7:9200", 
	},

	qiniu: {
		accessKey:"",
		secretKey:"",
		bucketName: "keepwork-dev",
		bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
	},
}

const productionConfig = {
	//keepworkBaseURL: "http://keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.6:8000/api/wiki/models/",
	origin: "http://api.keepwork.com",
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
	qiniu: {
		bucketName: "keepwork-dev",
		bucketDomian: "http://oy41aju0m.bkt.clouddn.com",
	},
	database: {
		database:"keepwork-rls",
	}
}

const developmentConfig = {
	origin: "http://api-stage.keepwork.com",
	//keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
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

const localConfig = {
}

const configs = {
	"production": _.merge({}, defaultConfig, productionConfig, secretConfig),
	"release": _.merge({}, defaultConfig, releaseConfig, secretConfig),
	"development": _.merge({}, defaultConfig, developmentConfig, secretConfig),
	"test": _.merge({}, defaultConfig, testConfig, secretConfig),
	"local": _.merge({}, defaultConfig, localConfig, secretConfig),
}

console.log(secretConfig.NODE_ENV || process.env.NODE_ENV);

export default configs[secretConfig.NODE_ENV || process.env.NODE_ENV];
