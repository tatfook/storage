import _ from "lodash";
import joi from "joi";
import Sequelize from "sequelize";

import sequelize from "@/models/database.js";

import ERR from "@/common/error.js";
import util from "@/common/util.js";

import qiniu from "@/models/qiniu.js";
import filesModel from "@/models/files.js";

const storage = qiniu;

const {like, gt, lte, ne, in: opIn} = Sequelize.Op;

export const Files = function(){
	this.model = filesModel;
}


Files.prototype.raw = async function(ctx) {
	const params = ctx.state.params;
	const filename = params.filename;
	const key = util.getKeyByPath(filename);

	const url = storage.getDownloadUrl(key).getData();
	console.log(url);

	ctx.redirect(url || 'http://git.keepwork.com/gitlab_rls_lixizhi/keepworkdatasource/raw/master/lixizhi_images/img_1520938234618.jpeg');
}

Files.prototype.token = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;

	const keys = key.split("/");
	
	if (keys.length < 2 || key.indexOf(username) != 0) return ERR.ERR_PARAMS();
	const filetype = keys[0].replace(username+ "_", "");

	//console.log(keys, key, filetype);
	if (filetype != "pages" && filetype != "files" && filetype != "images" && filetype == "datas") {
		return ERR.ERR_PARAMS();
	}

	const result =  storage.getUploadToken(key);
	if (result.isErr()) return result;

	const token = result.getData();
	
	return ERR.ERR_OK({token});
}

Files.prototype.statistics = async function(ctx) {
	let result = await sequelize.query("SELECT SUM(size) AS `sum`, COUNT(*) as `count` from `files`",  {type: sequelize.QueryTypes.SELECT });
	let data = result[0] || {};
	
	data.total = 2 * 1024 * 1024 * 1024;
	//console.log(result);

	return ERR.ERR_OK(data);
}

Files.prototype.url = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;
	const params = ctx.state.params;

	return 
}

Files.prototype.upsert = async function(ctx) {
	const params = ctx.state.params;
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;
	params.username = username;
	params.key = key;

	if (key.indexOf(username + "/") != 0 && key.indexOf(username + "_") != 0) {
		return ERR.ERR_PARAMS();
	}
	
	const content = params.content;
	params.content = undefined;
	// 内容存在，则写文件
	if (content) {
		let result = await storage.upload(key, content);
		if (result.isErr()) return result;

		params.hash = result.getData().hash;
	}

	let data = await this.model.upsert(params);

	return ERR.ERR_OK(data);
}

Files.prototype.delete = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;

	let data = await storage.delete(key);
	if (data.isErr()) return data;

	data = await this.model.destroy({
		where: {
			key: key,
			username: username,
		}
	});

	return ERR.ERR_OK(data);
}

Files.prototype.find = async function(ctx) {
	const params = ctx.state.params;
	const username = ctx.state.user.username;

	if (params.raw) {
		return storage.list(params.prefix || username);
	}

	
	const where = {};
	if (username) {
		where.username = username;
	} else {
		where.public = true;
	}

	if (params.type) {
		where.type = params.type;
	} else {
		where.type = {[ne]:"pages"};
	}

	where.username = username || params.username;

	let data = await this.model.findAll({
		where: where,
		limit: params.limit,
		offset: params.offset,
	})

	return ERR.ERR_OK(data);
}

Files.prototype.findOne = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;

	let content = undefined;
	let isPage = false;
	if (_.endsWith(key, ".md")) {
		content = await storage.get(key).then(ret => ret.getData());
		isPage = true;
	}

	let data = await this.model.findOne({
		where: {
			key: key,
			username: username,
		}
	})

	if (!data) {
		if (isPage) return ERR.ERR_OK({key, content});

		return ERR.ERR_NOT_FOUND();
	}

	data = data.get({plain: true});
	data.content = content;

	return ERR.ERR_OK(data);
}

// 重命名
Files.prototype.rename = async function(ctx) {
	const filename = ctx.state.params.filename;
	const id = ctx.params.id;
	const username = ctx.state.user.username;
	
	let data = await this.model.findOne({
		where: {
			id: id,
			username: username,
		}
	});

	if (!data) return ERR.ERR_NOT_FOUND();

	data = data.get({plain:true});
	
	// 七牛改名
	const srcKey = username + "_files/" + data.filename;
	const dstKey = username + "_files/" + filename;
	data = await storage.move(srcKey, dstKey);
	if (data.isErr()) return data;
	
	data = await this.model.update({
		filename: filename,
	}, {
		where: {
			id: id,
		}
	})
	
	return ERR.ERR_OK(data);
}

Files.prototype.qiniu = async function(ctx) {
	const params = ctx.request.body;
	const {key} = params;
	const username = key.split("/")[0].split("_")[0];
	//console.log(params);

	let data = await this.model.upsert({
		username: username,
		key:params.key,
		hash: params.hash,
		size: params.size,
		type: params.type,
		path: params.path == "null" ? undefined : params.path,
		filename: params.filename == "null" ? undefined : params.filename,
		public: params.public == "null" ? undefined : params.public,
	})
	
	// 添加记录失败 应删除文件
	if (!data) {
	}

	return ERR_OK(data);
}

Files.getRoutes = function() {
	const self = this;
	self.pathPrefix = "files";
	const routes = [
	{
		path: "qiniu",
		method: "post",
		action: "qiniu",
	},
	{
		path: "statistics",
		method: "get",
		action: "statistics",
		authentated: true,
	},
	{
		path: "raw",
		method: "get",
		action: "raw",
	},
	{
		path: ":id/url",
		method: "GET",
		action: "url",
		authentated: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		}
	},
	{
		path: ":id/token",
		method: "GET",
		action: "token",
		authentated: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		}
	},
	{
		path: ":id",
		method: "POST",
		action: "upsert",
		authentated: true,
		validate: {
			body: {
				key: joi.string().required(),
			},
		},
	},
	{
		path: ":id",
		method: "DELETE",
		action: "delete",
		authentated: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		},
	},
	{
		path: ":id/rename",
		method: "PUT",
		action: "update",
		authentated: true,
		validate: {
			body: {
				filename: joi.string().required(),
			},
			params: {
				id: joi.number().required(),
			}
		},
	},
	{
		path: ":id",
		method: "GET",
		action: "findOne",
		authentated: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		},
	},
	{
		path: "",
		method: "GET",
		action: "find",
		authentated: true,
	},
	];

	return routes;
}

export default Files;
