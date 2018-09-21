const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}

	async create() {
		const userId = this.authenticated().userId;
		const params = this.validate();

		params.userId = userId;
		delete params.userId;
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

		const project = await this.model.projects.getbyid(id);
		
		if (!project) return this.throw(404);

		project.star++;

		await this.model.projects.update({star:project.star}, {where:{id}});

		return this.success(project);
	}

	async unstar() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getbyid(id);
		
		if (!project) return this.throw(404);

		project.star--;

		await this.model.projects.update({star:project.star}, {where:{id}});

		return this.success(project);
	}
}

module.exports = Project;
