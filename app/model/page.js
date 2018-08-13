
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("pages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
		},

		key: {
			type: STRING(128),
			allowNull: false,
			unique: true,
		},

		folder: {
			type: STRING(128),
			allowNull: false,
		},
		
		hash: {
			type: STRING(64),
		},
		
		content: {
			type: TEXT,
			defaultValue: "",
		},

		keywords: {
			type: STRING,
		},

		title: {
			type: STRING(128),
		},

		description: {
			type: STRING(512),
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.pages.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getByKey = async function(key) {
		const data = await app.model.pages.findOne({where: {key}});

		return data && data.get({plain:true});
	}

	app.model.pages = model;
	return model;
};

