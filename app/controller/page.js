const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

//import {
	//ENTITY_VISIBILITY_PUBLIC,
	//ENTITY_VISIBILITY_PRIVATE,

	//USER_ACCESS_LEVEL_NONE,
	//USER_ACCESS_LEVEL_READ,
	//USER_ACCESS_LEVEL_WRITE,
//} from "@/core/consts.js";

const Page = class extends Controller {
	get modelName() {
		return "pages";
	}

	async isEditable(userId, key, username) {
		const keyObj = this.util.parseKey(key);
		if (!userId) return false;
		if (_.startsWith(key, username+"/")) return true;

		let site = await this.model.sites.getByName(keyObj.username, keyObj.sitename);
		if (!site) return false;

		if (site.userId == userId) return true;

		return await this.model.sites.isEditableByMemberId(site.id, userId);
	}

	async isReadable(userId, key, username) {
		const keyObj = this.util.parseKey(key);

		if (_.startsWith(key, username+"/")) return true;

		let site = await this.model.sites.getByName(keyObj.username, keyObj.sitename);
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

		const isReadable = await this.isReadable(user.userId, page.key, user.username);
		if (!isReadable) ctx.throw(401);

		return page;
	}

	async create() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({
			"key":"string",
			"content": "string",
		});
		params.hash = util.hash(params.content);

		const isEditable = await this.isEditable(user.userId, params.key, user.username);
		if (!isEditable) ctx.throw(401);

		if (_.startsWith(params.key, username+"/")) {
			params.userId = userId;
		} else {
			const user = await app.model.users.getByName(key.split("/")[0]);
			params.userId = user.id;
		}

		let page = await pages.create(params);
		if (!page) ctx.throw(500);
		page = page.get({plain:true});

		storage.upload(params.key, params.content);

		return page;
	}

	async update() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({
			"id":"int",
			"key":"string",
		});

		const isEditable = await this.isEditable(user.userId, params.key, user.username);
		if (!isEditable) ctx.throw(401);
		
		delete params.userId;

		if (params.content) {
			params.hash = util.hash(params.content);
			storage.upload(params.key, params.content);
		}

		await pages.update(params, {where:{id:params.id}});

		return ;
	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({"id":"int"});

		const page = await pages.getById(params.id);
		if (!page) ctx.throw(404);

		const isEditable = await this.isEditable(user.userId, page.key, user.username);
		if (!isEditable) ctx.throw(401);

		const ok = await pages.destroy(params.id);

		return ok;
	}

	async search() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const params = this.validate();
		const where = {};

		if (params.folder) where.folder = params.folder;

		const list = await pages.findAll({exclude:["content"], where});

		return list;	
	}

	async visit() {
		const {ctx, model, config, util} = this;
		const user = this.getUser();
		const params = this.validate({"key":"string"});

		let page = await model.pages.getByKey(params.key);
		if (!page) ctx.throw(404);
		
		const isReadable = await this.isReadable(user.userId, page.key, user.username);
		if (!isReadable) ctx.throw(401);

		return {page};
	}
}

module.exports = Page;

//const filetypes = {
	//"/": "folders",

	//".md": "pages",

	//".jpg": "images",
	//".jpeg": "images",
	//".png": "images",
	//".svg": "images",

	//".mp4": "videos",
	//".webm": "videos",

	//".mp3": "audios",
	//".ogg": "audios",
	//".wav": "audios",

	//".json": "datas",
	//".yml": "datas",

	////unknow: "files",
//}

//util.getTypeByKey = function(key) {
	//for (let ext in filetypes) {
		//if (_.endsWith(key, ext)) return filetypes[ext];
	//}

	//return "files";
//}

//util.isPage = function(key) {
	//return this.getTypeByKey(key) == "pages";
//}

//util.getUsernameByKey = function(key) {
	//return key.substring(0, key.indexOf("/"));
//}
//// 获取目录
//util.getFolderByKey = function(key) {
	//return key.substring(0, key.lastIndexOf("/", key.length-2) + 1);
//}

//util.getKeyByPath = function(path, filetype) {
	//const paths = path.split("/");

	//filetype = filetype || this.getTypeByKey(path);

	//paths.splice(1, 0, filetype);

	//return paths.join("/");
//}

//util.getPathByKey = function(key) {
	//const paths = key.split("/");
	////if (paths.length < 3) return key;
	//paths.splice(1, 1);

	//return paths.join('/');
//}

//util.parseKey = function(key) {
	//const obj = {key};
	//obj.path = this.getPathByKey(key);
	//obj.type = this.getTypeByKey(key);
	//obj.url = key.substring(0, key.lastIndexOf("."));

	//const paths = obj.path.split("/");
	//obj.username = paths[0];
	//obj.sitename = paths[1];

	//return obj;
//}

