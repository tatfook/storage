
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("siteFiles", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		fileId: {       // 文件ID
			type: BIGINT,
			allowNull: false,
		},

		userId: {  // 文件使用位置的的用户名
			type: BIGINT,
			allowNull: false,
		},

		siteId: {  // 文件使用位置的站点名
			type: BIGINT,
			allowNull: false,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["fileId", "userId", "siteId"],
		},
		],
	});

	model.getRawUrl = async function(data) {
		data.siteId = data.siteId || 0;

		let siteFile = await app.model.siteFiles.findOne({where:data}).then(o => o && o.toJSON());
		if (!siteFile) {
			siteFile = await app.model.siteFiles.create(data).then(o => o.toJSON());
		}
		const config = app.config.self;
		return config.origin + config.baseUrl + "siteFiles/" + siteFile.id + "/raw";
	}

	app.model.siteFiles = model;
	return model;
};

