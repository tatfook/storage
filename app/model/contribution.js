
const _ = require("lodash");

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

	const model = app.model.define("contributions", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 评论者
			type: BIGINT,
			unique: true,
			allowNull: false,
		},

		data: {
			type: JSON,
			defaultValue:{},
		}
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.addContributions = async function(userId, count = 1) {
		const date = new Date();
		const key = date.getFullYear() + '-' + _.padStart(date.getMonth() + 1, 2, "0") + '-' + _.padStart(date.getDate(), 2, "0");

		const data = await this.getByUserId(userId);

		data[key] = (data[key] || 0) + count;

		await app.model.contributions.upsert({
			userId,
			data,
		});
	}

	model.getByUserId = async function(userId) {
		let data = await app.model.contributions.findOne({where:{userId}});
		if (data) data = data.get({plain:true}); else data  = {}; 

		return data.data || {};
	}

	app.model.contributions = model;
	return model;
};

