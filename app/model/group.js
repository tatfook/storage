module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("groups", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		groupname: {
			type: STRING(48),
			allowNull: false,
		},

		description: {
			type: STRING(128),
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "groupname"],
		},
		],
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.groups.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.deleteById = async function(id, userId) {
		const group = await this.getById(id, userId);
		if (!group) return;

		await app.model.groups.destroy({where:{id}});
		await app.model.groupMembers.destroy({where:{groupId:id}});
		await app.model.siteGroups.destroy({where:{groupId:id}});

		return;
	}

	model.getGroupMembers = async function(userId, groupId) {
		const sql = `select u.id as userId, u.username, u.nickname, u.portrait 
			from groupMembers as gm, users as u
		   	where gm.memberId = u.id 
			and gm.groupId = :groupId and gm.userId = :userId`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements:{
				groupId,
				userId,
			}
		});

		return list;
	}

	app.model.groups = model;
	return model;
};


































