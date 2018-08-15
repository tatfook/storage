const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");


const Group = class extends Controller {
	get modelName() {
		return "groups";
	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});

		const ok = await model.groups.deleteById(params.id, userId);

		return this.success(ok);
	}
	
	// 添加成员
	async postMembers() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			memberName: "string",
		});

		const user = await this.model.users.getByName(params.memberName);
		if (!user) this.throw(400, "成员不存在");
		const memberId = user.id;

		const data = await this.model.groupMembers.create({
			userId,
			groupId: params.id,
			memberId,
			description: params.description,
		});

		return this.success(data);
	}

	// 删除成员
	async deleteMembers() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			memberName: "string",
		});

		const user = await this.model.users.getByName(params.memberName);
		if (!user) this.throw(400, "成员不存在");
		const memberId = user.id;

		const data = await this.model.groupMembers.destroy({where:{
			userId,
			groupId: params.id,
			memberId,
		}});

		return this.success(data);
	}

	// 获取组成员
	async getMembers() {
		const userId = this.authenticated().userId;
		const id = this.validate({id: "int"}).id;
		
		const list = await this.model.groups.getGroupMembers(userId, id);

		return this.success(list);
	}
}

module.exports = Group;