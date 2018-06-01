import joi from "joi";
import axios from "axios";

import ERR from "@/common/error.js";
import config from "@/config.js";
import qiniu from "@/models/qiniu.js";
import SiteFilesModel from "@/models/siteFiles.js";

const storage = qiniu;

export const SiteFiles = function() {
	this.model = SiteFilesModel;
}

SiteFiles.prototype.url = async function(ctx) {
	const params = ctx.state.params;
	const key = params.key;
	const username = ctx.state.user.username;

	if (key.indexOf(key, username + "_") != 0 && key.indexOf(key, username + "/") != 0) {
		return ERR.ERR_NO_PERMISSION();
	}

	if (username != params.username) {
		// 验证访问权限
	}
	
	const where = {
		username: params.username,
		sitename: params.sitename,
		key: params.key,
	};

	let data = await this.model.findOne({where});

	if (!data) data = await this.model.create(where);

	data = data.get({plain: true});

	const url = "/api/v0/siteFiles/" + data.id + "/raw";

	return ERR.ERR_OK(url);
}

SiteFiles.prototype.raw = async function(ctx) {
	const id = ctx.params.id;
	const username = ctx.state.user.username;

	let data = await this.model.findOne({where: {id:id}});

	if (!data) {
		ctx.status(404);
		ctx.body = "Not Found";
		return;
	}
	
	data = data.get({plain:true});

	if (username != data.username) {
		let result = await axios.get(config.keepworkBaseURL + "site_user/getSiteLevelByMemberName", {
			username:data.username,
			sitename:data.sitename,
			memberName: username,
		}).then(res => res.data);
		if (!result || result.data < 40) {
			ctx.status(400);
			ctx.body = "没有权限访问";
			return ;
		}
		// 权限判断
	}

	const url = storage.getDownloadUrl(data.key).getData();

	ctx.redirect(url);
}

SiteFiles.getRoutes = function() {
	const self = this;

	self.pathPrefix = "siteFiles";

	const routes = [
	{
		path: "url",
		method: "GET",
		action: "url",
		authentated: true,
		validate: {
			query: {
				key: joi.string().required(),
				username: joi.string().required(),
				sitename: joi.string().required(),
			},
		},
	},
	{
		path: ":id/raw",
		method: "GET",
		action: "raw",
		validate: {
			params: {
				id: joi.number().required(),
			}
		},
	},
	];

	return routes;
}

export default SiteFiles;
