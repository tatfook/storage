
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

	const model = app.model.define("caches", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		key: {  // 文件所属者
			type: STRING,
			allowNull: false,
			unique: true,
		},

		expire: {
			type: BIGINT,
			defaultValue: 0,
		},

		value: {
			type:JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	model.getByUserId = async function(userId) {
		const roles = await this.model.findAll({where: {userId}});

		return roles;
	}

	model.getRoleIdByUserId = async function(userId) {
		const roles = await this.model.findAll({where: {userId}});
		let roleId = USER_ROLE_NORMAL;
		_.each(roles, role => roleId = roleId | role.roleId);

		return roleId;
	}

	model.isExceptionRole = function(roleId = USER_ROLE_NORMAL) {
		return roleId & USER_ROLE_EXCEPTION;
	}

	model.isExceptionUser = async function(userId) {
		const roleId = await this.getRoleIdByUserId(userId);
		
		return this.isExceptionRole(roleId);
	}
	
	app.model.roles = model;
	return model;
};



