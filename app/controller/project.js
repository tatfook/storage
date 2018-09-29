const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}

	async search() {
		const model = this.model[this.modelName];
		const query = this.validate();

		this.formatQuery(query);

		const result = await model.findAndCount({...this.queryOptions, where:query});
		const rows = result.rows;
		const userIds = [];

		_.each(rows, (o, i) => {
			userIds.push(o.userId);
			rows[i] = o.get ? o.get({plain:true}) : o;
		});

		console.log(userIds);
		const users = await this.model.users.getUsers(userIds);
		console.log(users);
		_.each(rows, o => o.user = users[o.userId]);

		return this.success(result);
	}

	async create() {
		const userId = this.authenticated().userId;
		const params = this.validate();

		params.userId = userId;
		delete params.star;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;

		const data = await this.model.projects.create(params);

		return this.success(data);
	}

	async update() {
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});
		const id = params.id;

		delete params.userId;
		delete params.star;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;

		const data = await this.model.projects.update(params, {where:{id, userId}});

		return this.success(data);
	}

	async visit() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		
		if (!project) return this.throw(404);

		project.visit++;

		await this.model.projects.update({visit:project.visit}, {where:{id}});

		return this.success(project);
	}

	async star() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		
		if (!project) return this.throw(404);

		project.star++;

		await this.model.projects.update({star:project.star}, {where:{id}});

		return this.success(project);
	}

	async unstar() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		
		if (!project) return this.throw(404);

		project.star--;

		await this.model.projects.update({star:project.star}, {where:{id}});

		return this.success(project);
	}
}

module.exports = Project;
