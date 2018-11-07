const _ = require("lodash");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_PROJECT,
} = require("../core/consts.js");

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
		
		userId: {                    // 评论者
			type: BIGINT,
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

		content: {                   // 评论内容
			type: STRING(1024),
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
	
	model.createComment = async function(userId, objectId, objectType, content) {
		const user = await app.model.users.getById(userId);
		if (!user) return ;

		let data = await app.model.comments.create({
			userId,
			objectType,
			objectId,
			content,
			extra: {
				username: user.username,
				nickname: user.nickname,
				portrait: user.portrait,
			},
		});
		if (!data) return ;

		if (data.objectType == ENTITY_TYPE_PROJECT && app.model.projects.commentCreateHook) {
			await app.model.projects.commentCreateHook(data.objectId);	
		}
		
		return data.get({plain:true});
	} 

	model.deleteComment = async function(id, userId) {
		const where = {id};
		
		if (userId) where.userId = userId;

		const data = await app.model.comments.findOne({where});
		if (!data) return;

		await app.model.comments.destroy({where});

		if (data.objectType == ENTITY_TYPE_PROJECT && app.model.projects.commentDestroyHook) {
			await app.model.projects.commentDestroyHook(data.objectId);	
		}
	}

	model.getObjectsCount = async function(objectIds, objectType) {
		const sql = `select objectId, count(*) count from comments where objectType = :objectType and objectId in (:objectIds) group by objectId`;
		const list = await app.model.query(sql, {
			type: app.Sequelize.QueryTypes.Sequelize,
			replacements: {objectIds, objectType},
		});

		const counts = {};
		_.each(list, o => counts[o.objectId] = o.count);
		
		return counts;
	}

	app.model.comments = model;
	return model;
};



