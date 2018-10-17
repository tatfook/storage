const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} = require("../core/consts.js");

const Page = class extends Controller {
	get modelName() {
		return "pages";
	}

	getKeyByUrl(url) {
		return this.util.getKeyByPath(url + ".md");
	}

	getFolderByPath(path) {
		return path.substring(0, path.lastIndexOf("/", path.length-2) + 1);
	}

	parseUrl(url) {
		const obj = {};
		const paths = url.split("/");
		obj.username = paths[0];
		obj.sitename = paths[1];

		return obj;
	}

	async isEditable(userId, url, username) {
		const urlObj = this.parseUrl(url);
		if (!userId) return false;
		if (_.startsWith(url, username+"/")) return true;

		let site = await this.model.sites.getByName(urlObj.username, urlObj.sitename);
		if (!site) return false;

		if (site.userId == userId) return true;

		return await this.model.sites.isEditableByMemberId(site.id, userId);
	}

	async isReadable(userId, url, username) {
		const urlObj = this.parseUrl(url);

		if (_.startsWith(url, username+"/")) return true;

		let site = await this.model.sites.getByName(urlObj.username, urlObj.sitename);
		if (!site) return false;

		if (site.userId == userId) return true;

		return await this.model.sites.isReadableByMemberId(site.id, userId);
	}

	async show() {
		const {ctx, model, config, util} = this;
		const user = this.getUser();
		const pages = model.pages;
		const params = this.validate({"id":"int"});

		const page = await pages.getById(params.id);
		if (!page) ctx.throw(404);

		const isReadable = await this.isReadable(user.userId, page.url, user.username);
		if (!isReadable) ctx.throw(401);

		return this.success(page);
	}

	async create() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({
			"url":"string",
		});
		params.content = params.content;
		params.folder = this.getFolderByPath(params.url);
		params.hash = util.hash(params.content);

		const isEditable = await this.isEditable(user.userId, params.url, user.username);
		if (!isEditable) ctx.throw(401);

		if (_.startsWith(params.url, user.username+"/")) {
			params.userId = user.userId;
		} else {
			const tmp = await model.users.getByName(params.url.split("/")[0]);
			params.userId = tmp.id;
		}

		let page = await pages.create(params);
		if (!page) ctx.throw(500);
		page = page.get({plain:true});

		return this.success(page);
	}

	async update() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({
			"id":"int",
		});

		const page = await model.pages.getById(params.id);
		if (!page) this.throw(404);
		const isEditable = await this.isEditable(user.userId, page.url, user.username);
		if (!isEditable) ctx.throw(401);
		
		delete params.userId;

		if (params.content) {
			params.hash = util.hash(params.content);
		}

		await pages.update(params, {where:{id:params.id}});

		return this.success("OK");
	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({"id":"int"});

		const page = await pages.getById(params.id);
		if (!page) ctx.throw(404);

		const isEditable = await this.isEditable(user.userId, page.url, user.username);
		if (!isEditable) ctx.throw(401);

		const ok = await pages.destroy({where:{id:params.id}});

		return this.success(ok);
	}

	async index() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const params = this.validate();
		const where = {};

		const list = await pages.findAll({exclude:["content"], where: params});

		return this.success(list);	
	}

	async visit() {
		const {userId, username} = this.getUser();
		console.log(this.getUser());
		const {url} = this.validate({"url":"string"});

		let page = await this.model.pages.getByUrl(url);
		if (!page) this.throw(404);
		if (page.visibility && page.userId != userId) return this.throw(411);
		
		const isReadable = await this.isReadable(userId, page.url, username);
		if (!isReadable) this.throw(401);

		await this.model.pages.visitor(page.id, userId);

		return this.success({page});
	}
}

module.exports = Page;
