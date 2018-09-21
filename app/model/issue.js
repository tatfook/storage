
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("issues", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者者
			type: BIGINT,
			allowNull: false,
		},

		objectType: {                // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面 3 -- 组 4 -- 项目
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 所属对象id
			type: BIGINT,
			allowNull: false,
		},

		title: {                    // 内容
			type: STRING(256),
			defaultValue:"",
		},

		content: {                   // 内容
			type: STRING(512),
			defaultValue:"",
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.issues.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getObjectIssues = async function(objectId, objectType) {
		const result = await app.model.issues.findAndCount({where:{objectId, objectType}});
		const issues = result.rows;
		const total = result.count;

		const userIds = [];
		const issueIds = [];

		_.each(issues, (val, index) => {
			val = val.get ? val.get({plain:true}) : val;
			issues[index] = val;

			if (_.indexOf(userIds, val.userId) < 0) userIds.push(val.userId);
			if (_.indexOf(issueIds, val.id) < 0) issueIds.push(val.id); 
		});

		const assigns = await app.model.members.findAll({where:{
			objectId:{
				[app.Sequelize.Op.in]: issueIds,
			},
			objectType:ENTITY_TYPE_ISSUE,
		}});

		_.each(assigns, o => {
			o = o.get ? o.get({plain:true}) : o;
			if (_.indexOf(userIds, o.memberId) < 0) userIds.push(o.memberId);
		});

		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];
		const users = await app.model.users.findAll({
			attributes,
			where: {id:{[app.Sequelize.Op.in]:userIds}},
		});

		const tags = await app.model.tags.findAll({
			where: {
				objectId: {
					[app.Sequelize.Op.in]: issueIds,
				},
				objectType: ENTITY_TYPE_ISSUE,
			}
		});

		const getUser = (userId) => {
			const index = _.findIndex(users, o => {
				o = o.get ? o.get({plain:true}) : o;
				return o.userId == userId;
			});
			return users[index] || {}
		};

		const getAssigns = (id) => {
			const list = [];
			_.each(assigns, o => {
				o = o.get ? o.get({plain:true}) : o;
				if (o.objectId == id) {
					const user = getUser(o.memberId);
					user && list.push(user);
				}
			});

			return list;
		}

		const getTags = (id) => {
			const tagnames = [];
			_.each(tags, tag => {
				tag = tag.get ? tag.get({plain:true}) : tag;
				tag.objectId == id && tagnames.push(tag.tagname);
			});
			return tagnames;
		}

		_.each(issues, val => {
			val.tags = getTags(val.id);
			val.assigns = getAssigns(val.id);
			val.user = getUser(val.userId);
		});

		return issues;
	}

	app.model.issues = model;
	return model;
};
