
exports.self = {
	//debug: true,
	secret: "keepwork123456",
	origin: "http://api-stage.keepwork.com",
	baseUrl: "/core/v0/",
	apiUrlPrefix: "/api/v0/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
	gitGatewayURL: "http://10.27.2.117:7001/v0",
	esBaseURL: "http://10.27.2.117:7002/v0",

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

	pingpp: {
		key: "sk_test_HyXDCCvLK4y9Xzj5SCmTurn5",
		publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv9cdkOTHiyWsZzZ2YIAD
+C0I+GHy4xYMs12J0bFTHldWfcv5i2qmV/3q33ANRgKh/PAFZ4mVL+3F+xiOA6G6
apDj1v9pY+40XHlJTqUzTkWDuHD0tQ2Ze1rsYqhuC9Bl9H3TT+x5TRgLgHDhJZsz
y9VYveyvz4wLHeXOOErsXhxy0JRlXSPT/lAVPK1eIDJqnZbbbf6dliga79BZDPy9
uoiRZdV73lAfHXLcrjqA5ba27vqBUwJelkv+AZRvcqHdMmhAAtT1TrXUA8VZsYW9
Zuto7bx0WaGjPMCbLs8yLJ2oMohGG2ibxGSVRuecqvj7Z2PuX1Frnv26npEjWfMc
PwIDAQAB
-----END PUBLIC KEY-----`,
		privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDQYDIaBvMUYwgqrw9Jpj/wdpszkXqVk36z6vA1MVSaGIJlMMXp
U165grpZouWgYbtoAYgC7DojyGQKRoJYM2uJQAgT8xANoy/DWtFEYh6wcL6WkIA0
64B7Os0iCqHwX44QYcvY89w46a1/mNixRXYti05DWAUAXw2W8zqZjYamcQIDAQAB
AoGAFTXlg663aZjXCPk+1iFdGs4H6EzjrHwSBqBgiRmXYgQiqcg4LRL2bm23KE6j
jxrDp8eYH6wKEwBf5ofc1ruNM4EyKnyrqZrev4l50zmbLhRBUUbDN9T/RWkqNUiJ
cfba3aO/8JPTuQ7+hdy+Uqzz0WNj8uYbu8ez1JXDRdYn/10CQQD4onFl+wyLpaSA
n5IGMBXyuEek1in49rQbAzfZ9LBww77MipTl7V/DgWNFOGeJo3dlB9MVWw6HTa6F
HiAcR46fAkEA1oxxvoqwoyw9UEKhsBKwKFFjS23ssxmrK590bUgJFVNMdJ0pWrXA
I7GpTnA583KvHm8HOcZiiJjK73DMvPeA7wJAIa9oa6eioHzVl7OGxh3Xq2W6FyQI
1bke15YNCBN1oCF1BSM1Xx1U3xj1iRhGNsiV0XNI7tjCVCR7I3/cW9h6AwJBALOI
eNIiimcw6OnVqCmHqeNDH90J0k2ZCDSLzUh5RCiVOOBId0eR2YPE8lFR9hxy9nl4
HUrKaL+3Y/HzqU/jqP8CQGxUKsJ/g9zsWXo4Z/zJ2VW6Sbzhj8fkhNJNopF55HuY
euIg+bi36DRXSgq/3jhCVW7QhbLvOQwqRfpHBT0KF38=
-----END RSA PRIVATE KEY-----`,
	},
}

exports.sequelize = {
	dialect: "mysql",
	database: "keepwork-dev",
	host: '10.28.18.4',
	port: "32000",
	// production
	//database: "keepwork",
	//port: 3306,
	//host: '10.28.18.4',
	username: "root",
	password: "root",
}

exports.cluster = {
	listen: {
		port: 8081,
		hostname: "0.0.0.0",
	}
}
