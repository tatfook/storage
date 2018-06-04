import _ from "lodash";

import secretConfig from "./.config.js";

const defaultConfig = {
	secret: "keepwork",

	apiUrlPrefix: "/api/v0/",

	baseURL: "/api/v0/",
	host: "0.0.0.0",
	port: 3000,
	protocol: "http",
	origin: "http://storage-node.keepwork.com",

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
	qiniu: {
		bucketName: "keepwork",
		bucketDomian: "http://ov62qege8.bkt.clouddn.com",
	},

	keepworkBaseURL: "http://keepwork.com/api/wiki/models/",
}

const developmentConfig = {
	keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	database: {
		database:"keepwork-dev",
	}
}

const testConfig = {
	keepworkBaseURL: "http://stage.keepwork.com/api/wiki/models/",
	database: {
		database:"keepwork-dev",
	}
}

const configs = {
	"production": _.merge({}, defaultConfig, productionConfig, secretConfig),
	"development": _.merge({}, defaultConfig, developmentConfig, secretConfig),
	"test": _.merge({}, defaultConfig, testConfig, secretConfig),
}

export default configs[process.env.NODE_ENV];
