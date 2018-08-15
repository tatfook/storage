
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("users", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		username: {
			type: STRING(48),
			unique: true,
			allowNull: false,
		},

		password: {
			type: STRING(48),
			allowNull: false,
		},

		email: {
			type: STRING(24),
			unique: true,
		},

		cellphone: {
			type: STRING(24),
			unique: true,
		},

		nickname: {
			type: STRING(48),
		},

		portrait: {
			type: STRING(128),
		},

		sex: {
			type: STRING(4),
		},

		description: {
			type: STRING(128),
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	model.getByName = async function(username) {
		const data = await app.model.users.findOne({
			where: {username},
			exclude: ["password"],
		});

		return data && data.get({plain:true});
	}

	model.getById = async function(userId) {
		const data = await app.model.users.findOne({
			where: {id:userId},
			exclude: ["password"],
		});

		return data && data.get({plain:true});
	}

	app.model.users = model;
	return model;
};

































