
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

	const model = app.model.define("worlds", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 用户id
			type: BIGINT,
			allowNull: false,
		},

		worldName: {
			type: STRING(128),
			allowNull: false,
		},

		revision: {
			type: STRING(32),	
			allowNull: false,
		},

		opusId: {
			type: BIGINT,
			allowNull: false,
		},
		
		extra: {
			type: JSON,
			defaultValue: {},
		}

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	

	app.model.worlds = model;
	return model;
};

