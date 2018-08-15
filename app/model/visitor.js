
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("comments", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 访问者
			type: BIGINT,
			allowNull: false,
		},

		objectType: {                // 访问对象类型  0 -- 用户  1 -- 站点  2 -- 页面
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 访问对象id
			type: BIGINT,
			allowNull: false,
		},

		count: {                    // 访问次数
			type: INTEGER,
			defaultValue:0,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["objectId", "objectType"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.createComment = async function(userId, objectId, objectType = EN) {
		const user = userId && await app.model.users.getById(userId);

		let visitor = await app.model.visitors.findOne({where:{objectType,objectId}});
		if (visitor) visitor = visitor.get({plain:true});
		else visitor = {coount:0, extra:{visitors:[]}};
		const visitors = visitor.extra.visitors;
		visitor.count++;

		if (user) {
			visitors.splice(_.findIndex(visitors, o => o.userId == userId), 1);
			visitors.splice(0,0,{
				username: user.username,
				nickname: user.nickname,
				portrait: user.portrait,
			}),
			visitors.length > 500 && visitors.pop();
		}

		await app.model.comments.upsert({
			count,
			extra:{visitors},
			objectType,
			objectId
		});
		
		return;
	} 

	app.model.visitors = model;
	return model;
};
