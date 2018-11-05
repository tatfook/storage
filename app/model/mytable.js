
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("mytable", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		//No: {
			//type: BIGINT,
			//allowNull: false,
			//autoIncrement: true,
		//},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		//engine: "myisam",

		//indexes: [
		//{
			//unique: true,
			//fields: ["userId", "id"],
		//},
		//],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	return model;
};
