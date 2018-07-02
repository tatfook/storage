import joi from "joi";
import _ from "lodash";
import axios from "axios";

import ERR from "@/common/error.js";
import config from "@/config.js";
import qiniu from "@/models/qiniu.js";
import SiteFilesModel from "@/models/siteFiles.js";
import FilesModel from "@/models/files.js";

const storage = qiniu;

export const SiteFiles = function() {
	this.model = SiteFilesModel;
}

SiteFiles.prototype.url = async function(ctx) {
	const params = ctx.state.params;
	const fileId = params.fileId;
	const userId = ctx.state.user.userId;

	if (userId != params.userId) {
		// 验证访问权限
	}
	
	const where = {
		userId: params.userId,
		siteId: params.siteId,
		fileId: params.fileId,
	};

	let data = await this.model.findOne({where});

	if (!data) data = await this.model.create(where);

	data = data.get({plain: true});

	const url = "/api/v0/siteFiles/" + data.id + "/raw";

	return ERR.ERR_OK(url);
}

SiteFiles.prototype.raw = async function(ctx) {
	const id = ctx.params.id;
	const userId = ctx.state.user.userId;

	let data = await this.model.findOne({where: {id:id}});

	if (!data) {
		ctx.status(404);
		ctx.body = "Not Found";
		return;
	}

	data = data.get({plain:true});

	let file = await FilesModel.findOne({where:{id:data.fileId}});
	if (!file) {
		ctx.status(404);
		ctx.body = "Not Found";
		return;
	}
	file = file.get({plain:true});

	if (userId != data.userId) {
		let result = await axios.get(config.keepworkBaseURL + "site_user/getSiteLevelByMemberName", {
			userId:data.userId,
			siteId:data.siteId,
			memberId: userId,
		}).then(res => res.data);
		if (!result || result.data < 40) {
			ctx.status(400);
			ctx.body = "没有权限访问";
			return ;
		}
		// 权限判断
	}

	const url = storage.getDownloadUrl(file.key).getData();

	console.log(url);

	ctx.redirect(url);
}

SiteFiles.prototype.find = async function(ctx) {
	const params = ctx.state.params;
	params.userId = ctx.state.user.userId;

	const result = await this.model.findAndCount({where: params});
	const rows = [];
	_.each(result.rows, item => {
		item = item.get({plain:true});
		item.url = "/api/v0/siteFiles/" + item.id + "/raw";
		rows.push(item);
	});

	return ERR.ERR_OK({count:result.count, rows:rows});
}

SiteFiles.getRoutes = function() {
	const self = this;

	self.pathPrefix = "siteFiles";

	const routes = [
	{
		path: "",
		method: ["GET", "POST"],
		action: "find",
		authentated: true,
	},
	{
		path: "url",
		method: "POST",
		action: "url",
		authentated: true,
		validate: {
			body: {
				fileId: joi.number().required(),
				userId: joi.number().required(),
				siteId: joi.number().required(),
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
