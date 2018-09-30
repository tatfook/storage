
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

	const model = app.model.define("projects", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 拥有者
			type: BIGINT,
			allowNull: false,
		},

		name: {                      // 项目名称
			type: STRING(255),
			allowNull: false,
		},

		siteId: {                    // 站点Id
			type: BIGINT,
		},

		visibility: {                // 可见性 0 - 公开 1 - 私有
			type: INTEGER, 
			defaultValue: 0,
		},

		privilege: {                 // 权限
			type: INTEGER,
			defaultValue: 0,
		},

		type: {                      // 评论对象类型  0 -- paracrfat  1 -- 网站 
			type: INTEGER,
			allowNull: false,
			defaultValue: 1,
		},

		visit: {                     // 访问量
			type: INTEGER,
			defaultValue:0,
		},

		star: {                      // 点赞数量
			type: INTEGER,
			defaultValue: 0,
		},

		stars: {                     // 点赞用户id 列表
			type: JSON,
			defaultValue:[],
		},

		hotNo: {
			type: INTEGER,           // 热门编号
			defaultValue: 0,
		},

		choicenessNo: {              // 精选编号
			type: INTEGER,
			defaultValue: 0,
		},

		hotNo: {
			type: INTEGER,           // 热门编号
			defaultValue: 0,
		},

		description: {               // 项目描述
			type: STRING(255),
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
		indexes: [
		{
			unique: true,
			fields: ["userId", "name"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.projects.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getJoinProjects = async function(userId) {
		const sql = `select projects.* from projects, members where 
			members.memberId = :memberId and projects.id = members.objectId 
			and objectType = :objectType`;

		const list = app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				memberId: userId,
			   	objectType,
			}
		});

		return list;
	}

	app.model.projects = model;
	return model;
};




