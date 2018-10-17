
exports.self = {
	debug: true,
	secret: "keepwork",
	apiUrlPrefix: "/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",

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

	qiniu: {
		accessKey:"LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq",
		secretKey:"IHdepXixI3ZHsQeH662Tf5CPhqWnFpXxc2GF2UXf",
		bucketName: "keepwork-dev",
		bucketDomain: "http://oy41aju0m.bkt.clouddn.com",
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

exports.cluster = {
	listen: {
		port: 7000,
		hostname: "0.0.0.0",
	}
}

exports.sequelize = {
	dialect: "mysql",
	database: "keepwork-test",
	host: '10.28.18.4',
	port: "32000",
	username: "root",
	password: "root",
}
