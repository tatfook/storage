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
	keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",

	database: {
		//port:3306,
		host: '39.106.11.114',
		type: "mysql",
		database: "keepwork-dev", // 数据库名
		username: "wuxiangan",
		password: "", 
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

const testConfig = {
}

const localConfig = {
	
}

const configs = {
	"production": _.merge({}, defaultConfig, productionConfig, secretConfig),
	"development": _.merge({}, defaultConfig, developmentConfig, secretConfig),
	"test": _.merge({}, defaultConfig, testConfig, secretConfig),
	"local": _.merge({}, defaultConfig, localConfig, secretConfig),
}

console.log(secretConfig.NODE_ENV || process.env.NODE_ENV);

export default configs[secretConfig.NODE_ENV || process.env.NODE_ENV];
