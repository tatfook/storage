import _ from "lodash";

import Model from "./model.js";

import {
	USER_ROLE_EXCEPTION,
	USER_ROLE_NORMAL,
	USER_ROLE_VIP,
	USER_ROLE_MANAGER,
	USER_ROLE_ADMIN,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Roles = class extends Model {
	constructor() {
		super();
	}

	async getRolesByUserId(userId) {
		let roles = await this.model.findAll({
			where: {
				userId,
			}
		});

		return ERR.ERR_OK(roles);
	}

	async getRoleIdByUserId(userId) {
		let roles = await this.model.findAll({
			where: {
				userId,
			}
		});

		let roleId = USER_ROLE_NORMAL;

		_.each(roles, role => roleId = roleId | role.roleId);

		return roleId;
	}

	isExceptionUser(roleId = USER_ROLE_NORMAL) {
		return roleId & USER_ROLE_EXCEPTION;
	}
}

export default new Roles();
