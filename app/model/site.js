const _ = require("lodash");
const consts = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const {
		ENTITY_VISIBILITY_PUBLIC,
		ENTITY_VISIBILITY_PRIVATE,

		USER_ACCESS_LEVEL_NONE,
		USER_ACCESS_LEVEL_READ,
		USER_ACCESS_LEVEL_WRITE,
	} = consts;

	const model = app.model.define("sites", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		sitename: {
			type: STRING(48),
			allowNull: false,
		},

		visibility: {
			type: INTEGER, // public private
			defaultValue: 0,
		},

		description: {
			type: STRING(128),
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
			fields: ["userId", "sitename"],
		},
		],
	});

	//model.sync({force:true});
	
	model.get = async function(userId) {
		const list = await app.model.sites.findAll({where:{userId}});

		return list;
	}

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.sites.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getByName = async function(username, sitename) {
		const sql = `select sites.*, users.username
			from users, sites
			where users.id = sites.userId 
			and users.username = :username and sites.sitename = :sitename`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				username,
				sitename,
			},
		});
		
		if (list.length == 1) {
			return list[0];
		}

		return;
	}

	model.isEditableByMemberId = async function(siteId, memberId) {
		const level = await this.getMemberLevel(siteId, memberId);

		if (level >= USER_ACCESS_LEVEL_WRITE) return true;

		return false;
	}

	model.isReadableByMemberId = async function(siteId, memberId) {
		const level = await this.getMemberLevel(siteId, memberId);

		if (level >= USER_ACCESS_LEVEL_READ) return true;

		return false;
	}

	model.getMemberLevel = async function(siteId, memberId) {
		let site = await app.model.sites.findOne({where:{id:siteId}});
		if (!site) return USER_ACCESS_LEVEL_NONE;
		site = site.get({plain: true});

		if (!memberId) return site.visibility == ENTITY_VISIBILITY_PRIVATE ? USER_ACCESS_LEVEL_NONE : USER_ACCESS_LEVEL_READ;

		if (siteId.userId == memberId) return USER_ACCESS_LEVEL_WRITE;

		let level = site.visibility == ENTITY_VISIBILITY_PRIVATE ? USER_ACCESS_LEVEL_NONE : USER_ACCESS_LEVEL_READ;

		let sql = `select level 
			from siteMembers
			where siteId = :siteId and memberId = :memberId`;
		let list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				siteId,
				memberId,
			}
		});
		
		_.each(list, val => level = level < val.level ? val.level : level);

		sql = `select siteGroups.level 
			from sites, siteGroups, groupMembers 
			where sites.id = siteGroups.siteId and siteGroups.groupId = groupMembers.groupId 
			and sites.id = :siteId and groupMembers.memberId = :memberId`;

		list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				siteId: siteId,
				memberId: memberId,
			}
		});

		_.each(list, val => level = level < val.level ? val.level : level);

		return level;
	}

	model.getJoinSites = async function(userId, level) {
		level = level || USER_ACCESS_LEVEL_WRITE;

		const sql = `select sites.*, users.username
			from sites, siteGroups, groupMembers, users 
			where sites.id = siteGroups.siteId and siteGroups.groupId = groupMembers.groupId and sites.userId = users.id
			and groupMembers.memberId = :memberId and siteGroups.level >= :level`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				memberId: userId,
				level: level,
			}
		});

		return list;

	}

	model.getSiteGroups = async function(userId, siteId) {
		const sql = `select siteGroups.id, siteGroups.siteId, siteGroups.groupId, siteGroups.level, groups.groupname 
			from siteGroups, groups
		   	where siteGroups.groupId = groups.id 
			and siteGroups.userId = :userId and siteGroups.siteId = :siteId`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements:{
				userId,
				siteId,
			}
		});

		return list;
	}

	app.model.sites = model;
	return model;
};


































