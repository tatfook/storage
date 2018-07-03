import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import sequelize from "@/models/database.js";

const userModel = models["users"];
const groupMembersModel = models["groupMembers"];

import ERR from "@@/common/error.js";

export const GroupMembers = class extends Controller {
	constructor() {
		super();
	}

	async create(ctx) {
		const params = ctx.state.params;
		params.userId = ctx.state.user.userId;

		const user = await userModel.findOne({
			where: {
				id: params.memberId,
			}
		});

		if (!user) {
			return ERR.ERR().setMessage("用户不存在");
		}

		let result = await this.model.create(params);

		return ERR.ERR_OK(result);
	}

	async find(ctx) {
		const userId = ctx.state.user.userId;
		let sql = `select groupMembers.id, groupMembers.userId, groupMembers.groupId, groupMembers.level, groupMembers.memberId, groups.groupname, users.username as memberUsername, users.nickname as memberNickname, users.portrait as memberPortrait
				   from groupMembers, groups, users 
				   where groupMembers.groupId = groups.id and groupMembers.memberId = users.id 
				   and groupMembers.userId = :userId`;

		let result = await this.model.query(sql, {
			replacements: {
				userId:userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	async findOne(ctx) {
		const id = ctx.params.id;
		const userId = ctx.state.user.userId;
		let sql = `select groupMembers.id, groupMembers.userId, groupMembers.groupId, groupMembers.level, groupMembers.memberId, groups.groupname, users.username as memberUsername, users.nickname as memberNickname, users.portrait as memberPortrait
				   from groupMembers, groups, users 
				   where groupMembers.groupId = groups.id and groupMembers.memberId = users.id 
				   and groupMembers.id=:id and groupMembers.userId = :userId`;

		let result = await this.model.query(sql, {
			replacements: {
				userId:userId,
				id:id,
			}
		});

		return ERR.ERR_OK(result[0]);
	}

	static getRoutes() {
		this.pathPrefix = "groupMembers";
		const baseRoutes = super.getRoutes();

		const routes = [
		{
			method: "POST",
			action: "create",
			authentated: true,
			validate: {
				body: {
					memberId: joi.number().required(),
					level: joi.number().required(),
					groupId: joi.number().required(),
				},
			}
		},
		{
			path: ":id",
			method: "GET",
			action: "findOne",
			authentated: true,
			validate: {
				params: {
					id: joi.number().required(),
				},
			}
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default GroupMembers;
