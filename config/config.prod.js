
exports.self = {
	secret: "keepwork123456",
	baseUrl: "/api/v0/",
	apiUrlPrefix: "/api/v0/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
	gitGatewayURL: "http://10.27.2.117:7001/v0",
	esGatewayURL: "http://10.27.2.117:3030/v0",
	trustIps: [
		"127.0.0.1",
		"120.132.120.183",
	    "120.132.120.161",
	    "121.14.117.252",
	    "121.14.117.251",
	],
	email: {
		host: "smtp.exmail.qq.com",
		port: 587,
		user: "noreply@mail.keepwork.com",
		pass: "M3Hbhq6KAZzagFP4",
		from: "noreply@mail.keepwork.com",
	},

	sms: {
		serverIP: "app.cloopen.com",
		serverPort: "8883",
		softVersion: "2013-12-26",
		appId: "8a216da85d158d1b015d5a30365c1bfe",
		accountSid: "8a216da85cce7c54015ce86f168408f1",
		accountToken: "2030b26949574f0694413a4881caf0b8",
	},

	oauths: {
		github: {
			clientId: "5cc0cf681e677a56771b",
			clientSecret: "7d843c4eff4a4bd64d03076e04d5eff234a64091",
		},
		qq: {
			clientId:"101403344",
			clientSecret: "01bd221b70beee7ffc64230e4a261873",
		},
		weixin: {
			clientId: "wxc97e44ce7c18725e",
			clientSecret: "eed69599248b4e8096300910c1a56db4",
		},
		xinlang: {
			clientId: "2411934420",
			clientSecret: "1dacf114c693d67c382de8f1da225ebb",
		},
	},
}

exports.sequelize = {
	dialect: "mysql",
	database: "lesson-dev",
	host: '10.28.18.16',
	port: "32000",
	username: "root",
	password: "root",
}

exports.cluster = {
	listen: {
		port: 7001,
		hostname: "0.0.0.0",
	}
}
