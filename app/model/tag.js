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

	const model = app.model.define("tags", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 评论者
			type: BIGINT,
			allowNull: false,
		},

		tagname: {
			type: STRING(24),
			allowNull: false,
		},

		objectType: {                // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 评论对象id
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
			fields: ["tagname", "objectId", "objectType"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getObjectTags = async function(objectId, objectType) {
		const list = await app.model.tags.findAll({where:{
			objectId, 
			objectType,
		}});

		const tags = [];
		for (let i = 0; i < list.length; i++) {
			const t = list[i].get({plain:true});
			tags.push(t.tagname);
		}

		return tags;
	}
	
	model.setObjectTags = async function(objectId, objectType, tags, userId) {
		await app.model.tags.destroy({where:{objectId, objectType}});

		for (let i = 0; i < tags.length; i++) {
			await app.model.tags.create({
				objectId, objectType, userId,
				tagname: tags[i],
			});
		}
	}

	app.model.tags = model;
	return model;
};

