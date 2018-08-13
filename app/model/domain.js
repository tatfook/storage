module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("domains", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		domain: {
			type: STRING(32),
			unique: true,
			allowNull: false,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		siteId: {
			type: BIGINT,
			allowNull: false,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.domains.findOne({where: where});

		return data && data.get({plain:true});
	}

	app.model.domains = model;
	return model;
};


































