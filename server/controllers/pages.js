import joi from "joi";
import _ from "lodash";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import consts from "@@/common/consts.js";
import ERR from "@@/common/error.js";
import qiniu from "@/models/qiniu.js";
import gitlab from "@@/common/api/gitlab.js";
import util from "@@/common/util.js";

const storage = qiniu;

const sitesModel = models["sites"];

function writeGitFile(params) {
	const path = params.key;
	const options = {
		content: params.content,
		commit_message: "note site create or update",
	}

	gitlab.upsertFile(params.key, {content:params.content});
}

function writeGitFile(params) {
	const path = params.key;
	const options = {
		content: params.content,
		commit_message: "note site create or update",
	}

	gitlab.upsertFile(params.key, {content:params.content});
}

export const Pages = class extends Controller {
	constructor() {
		super();
	}

	async isEditable(userId, key) {
		const keyObj = util.parseKey(key);
		if (!userId) return false;

		let site = await sitesModel.getByName(keyObj.username, keyObj.sitename);
		if (site.isErr()) return false;
		site = site.getData();

		if (site.userId == userId) return true;

		return await sitesModel.isEditableByMemberId(site.id, userId);
	}

	async getByKey(ctx) {
		const username = ctx.state.user.username;
		const params = ctx.state.params;
		const key = params.key;

		let result = await this.model.findOne({where:{key}});
		result = result ? result.get({plain:true}) : {key};
		
		if (!result.hash) {
			result.content = await storage.get(key).then(ret => ret.getData());
		}

		return ERR.ERR_OK(result);
	}

	async deleteByKey(ctx) {
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		const key = params.key;

		if (!await this.isEditable(userId, key)) return ERR.ERR_NO_PERMISSION();

		let result = await this.model.delete({where:{key}});

		return ERR.ERR_OK(result);
	}

	async upsert(ctx) {
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;

		if (!params.key) return ERR.ERR_PARAMS();
		if (!await this.isEditable(userId, params.key)) return ERR.ERR_NO_PERMISSION();

		writeGitFile(params);
		storage.upload(params.key, params.content);

		const result = await this.model.upsert(params);

		return ERR.ERR_OK(result);
	}

	async search(ctx) {
		const params = ctx.state.params;
		const where = {};

		if (params.folder) where.folder = params.folder;

		const list = await this.model.findAll({where});

		return ERR.ERR_OK(list);	
	}

	async visitByKey(ctx) {
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		const key = params.key;
		const keyObj = util.parseKey(key);

		let page = await this.model.getByKey(key);
		if (page.isErr()) return page;

		page = page.getData();

		const usersModel = models["users"];
		const visitorsModel = models["visitors"];

		let userinfo = await usersModel.getByUsername(keyObj.username);
		if (userinfo.isErr()) return userinfo;
		userinfo = userinfo.getData();

		visitorsModel.addPageVisitorCount(page.id, userinfo.id, userId);

		return ERR.ERR_OK({page, userinfo});
	}

	async qiniuImport(ctx) {
		const params = ctx.state.params;
		let marker = undefined;
		let keys = {};
		do {
			let result = await storage.list(params.prefix || "", 200, marker);
			if (result.isErr()) return result;
			let data = result.getData();
			let items = data.items;
			marker = data.marker;

			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let key = item.key;
				let folder = util.getFolderByKey(key);

				if (!_.endsWith(key, ".md")) continue;
				await this.model.upsert({
					key: item.key,
					folder: folder,
				});

				do {
					key = folder;
					folder = util.getFolderByKey(key);
					
					if (keys[key]) continue;

					await this.model.upsert({
						key:key,
						folder: folder,
					});

					keys[key] = true;
				} while(folder);
			}

		} while(marker);

		return ERR.ERR_OK();
	}

	static getRoutes() {
		this.pathPrefix = "pages";
		const baseRoutes = super.getRoutes();

		const routes = [
		{
			path: "visitByKey",
			method: ["GET", "POST"],
			action: "visitByKey",
			validated: {
				key: joi.string().required(),
			}
		},
		{
			path: "qiniuImport",
			method: "get",
			action: "qiniuImport",
		},
		{
			path:"getByKey",
			action: "getByKey",
			method: "GET",
			validate: {
				query: {
					key: joi.string().required(),
				},
			}
		},
		{
			path:"deleteByKey",
			action: "deleteByKey",
			method: "DELETE",
			authenticated: true,
			validate: {
				query: {
					key: joi.string().required(),
				},
			}
		},
		{
			path:"search",
			action: "search",
			method: ["GET", "POST"],
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default Pages;
