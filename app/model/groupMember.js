module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("groupMembers", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		groupId: {
			type: BIGINT,
			allowNull: false,
		},

		memberId: {
			type: BIGINT,
			allowNull: false,
		},

		level: {
			type: INTEGER,
			defaultValue: 0,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["groupId", "memberId"],
		},
		],
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.groups.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getByUserId = async function(userId) {
		let sql = `select groupMembers.id, groupMembers.userId, groupMembers.groupId, groupMembers.level, groupMembers.memberId, groups.groupname, users.username as memberUsername, users.nickname as memberNickname, users.portrait as memberPortrait
				   from groupMembers, groups, users 
				   where groupMembers.groupId = groups.id and groupMembers.memberId = users.id 
				   and groupMembers.userId = :userId`;

		let list = await app.model.query(sql, {
			replacements: {
				userId:userId,
			}
		});

		return list;
	}

	app.model.groupMembers = model;
	return model;
};


