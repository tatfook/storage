import _ from "lodash";
import joi from "joi";
import axios from "axios";
import Sequelize from "sequelize";
import sequelize from "../models/database.js";

import ERR from "../../common/error.js";
import gitlab from "../../common/api/gitlab.js";
import util from "../../common/util.js";
import {
	QINIU_AUDIT_STATE_NO_AUDIT,
	QINIU_AUDIT_STATE_PASS,
	QINIU_AUDIT_STATE_NOPASS,
	QINIU_AUDIT_STATE_FAILED,
} from "@@/common/consts.js";

import qiniu from "../models/qiniu.js";
import filesModel from "../models/files.js";

const storage = qiniu;

const {like, gt, lte, ne, in: opIn} = Sequelize.Op;

export const Files = function(){
	this.model = filesModel;
}

function writeGitFile(params) {
	const path = params.key;
	const options = {
		content: params.content,
		commit_message: "note site create or update",
	}

	gitlab.upsertFile(params.key, {content:params.content});
}

Files.prototype.isAuth = function (username, key)  {
	if (key.indexOf(username + "/") == 0) {
		return true;
	}

	return false;
}

Files.prototype.getFileFolder = async function(key) {
	const parentKey = key.substring(0, key.lastIndexOf("/", key.length-2) + 1);

	const result = await storage.get(parentKey);

	if (result.isErr()) return {};

	return result.getData();
}

Files.prototype.raw = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);

	const url = storage.getDownloadUrl(key).getData();

	ctx.redirect(url);
}

Files.prototype.token = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	const username = ctx.state.user.username;

	if (key.indexOf(username + "/") != 0) return ERR.ERR_PARAMS();

	return storage.getUploadToken(key);
}

Files.prototype.statistics = async function(ctx) {
	const userId = ctx.state.user.userId;
	let result = await sequelize.query("SELECT SUM(size) AS `sum`, COUNT(*) as `count` from `files where `userId` = :userId`", {
		type: sequelize.QueryTypes.SELECT,
		raw: true,
		replacements:{
			userId: userId,
		},	
	});
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
	const userId = ctx.state.user.userId;

	params.userId = userId;
	params.key = key;
	params.folder = util.getFolderByKey(key);
	params.type = util.getTypeByKey(key);

	if (util.getUsernameByKey(key) != username) {
		return ERR.ERR_PARAMS();
	}
	
	const content = params.content;
	params.content = undefined;
	// 内容存在，则写文件
	if (content) {
		let result = await storage.upload(key, content);
		if (result.isErr()) return result;

		params.hash = result.getData().hash;

		// 往git写一份
		writeGitFile({key, content});
	}

	let data = await this.model.upsert(params);

	return ERR.ERR_OK(data);
}

Files.prototype.delete = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);

	let data = await storage.delete(key);
	if (data.isErr()) return data;

	data = await this.model.destroy({
		where: {
			key: key,
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

	if (!this.isAuth(username, params.folder)) return ERR.ERR_PARAMS();
	
	const where = {};

	where.folder = params.folder;
	if (params.type) where.type = params.type;

	let data = await this.model.findAll({
		where: where,
		limit: params.limit,
		offset: params.offset,
	})

	return ERR.ERR_OK(data);
}

Files.prototype.findOne = async function(ctx) {
	const key = decodeURIComponent(ctx.params.id);
	//const userId = ctx.state.user.userId;

	let content = undefined;
	let isPage = false;
	if (_.endsWith(key, ".md")) {
		content = await storage.get(key).then(ret => ret.getData());
		isPage = true;
	}

	let data = await this.model.findOne({
		where: {
			key: key,
			//username: username,
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
	
	let data = await this.model.findOne({
		where: {
			id: id,
		}
	});

	if (!data) return ERR.ERR_NOT_FOUND();

	data = data.get({plain:true});
	
	// 七牛改名
	const srcKey = data.key;
	const dstKey =srcKey.substring(0, srcKey.lastIndexOf("/") + 1) + filename;
	data = await storage.move(srcKey, dstKey);
	if (data.isErr()) return data;
	
	data = await this.model.update({
		key: dstKey,
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
	let key = params.key;
	let folder = util.getFolderByKey(key);
	let type = util.getTypeByKey(key);

	params.key = key;
	params.folder = folder;
	params.type = type;

	let data = await this.model.upsert(params);
	// 添加记录失败 应删除文件
	if (params.content) writeGitFile(params);

	do {
		key = folder;
		folder = util.getFolderByKey(key);
		type = util.getTypeByKey(key);
		
		this.model.upsert({key, folder, type, size: 0});
	} while(folder);
	
	return ERR.ERR_OK(data);
}


Files.prototype.qiniuImport = async function(ctx) {
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
			await this.model.upsert({
				key: item.key,
				hash: item.hash,
				size: item.fsize,
				folder: folder,
				type: util.getTypeByKey(key),
			});

			do {
				key = folder;
				folder = util.getFolderByKey(key);
				
				if (keys[key]) continue;

				await this.model.upsert({
					key:key,
					size: 0,
					folder: folder,
					type: util.getTypeByKey(key),
				});

				keys[key] = true;
			} while(folder);
		}

	} while(marker);

	return ERR.ERR_OK();
}

Files.prototype.transform = async function(ctx) {
	let list = await storage.list("xiaoyao");
	list = list.data.items;

	const moves = [];

	for (var i = 0; i < list.length; i++) {
		let srcKey = list[i].key;
		let paths = srcKey.split("/");
		let username = paths[0];
		let dstKey = srcKey;
		paths.splice(1, 0, username.split("_")[1] || "pages");
		paths[0] = "xiaoyao";
		dstKey = paths.join("/");
		console.log(srcKey, dstKey);
		moves.push({
			srcKey,
			dstKey,
		});
	}

	await storage.batchMove(moves);

	return ERR.ERR_OK(list);
}

Files.prototype.audit = async function(ctx) {
	const params = ctx.state.params;
	console.log(params);
	// id 需加密解密
	const data = util.aesDecode(params.id, config.secret);
	const result = params.result;
	const pulp = result.pulp;
	const terror = result.terror;
	const politician = result.politician;
	let auditResult = QINIU_AUDIT_STATE_NO_AUDIT;
	
	if (!data || !data.id) {
		console.log("数据错误");
		return;
	}
	const id = data.id;
	//console.log(data);

	if (pulp.code != 0 || terror.code != 0 || politician.code != 0) {
		auditResult = QINIU_AUDIT_STATE_FAILED;
	} else {
		const pulpLabels = pulp.result.labels;
		const terrorLabels = terror.result.labels;
		const politicianLabels = politician.result.labels;

		let index = _.findIndex(pulpLabels, label => label.label != '2');
		index = index == -1 && _.findIndex(terrorLabels, label => label.label != '0');

		if (index != -1 || politicianLabels) {
			auditResult = QINIU_AUDIT_STATE_NOPASS;
		} else {
			auditResult = QINIU_AUDIT_STATE_PASS;
		}
	}

	console.log(id, auditResult);

	let ok = await this.model.update({
		checked: auditResult,
	}, {
		where: {
			id: id,
		}
	});

	//console.log(ok);
	//console.log(result.pulp.result);
	//console.log(result.terror.result);
	//console.log(result.politician.result);
}

//Files.prototype.videoAudit = async function(ctx) {
	//const params = ctx.state.params;
	//const result = await storage.videoAudit(params.id || 0, params.key, false);
	//const pulpLabels = result.pulp.labels;
	//const terrorLabels = result.terror.labels;
	//const politicianLabels = result.politician.labels;
	//let auditResult = QINIU_AUDIT_STATE_NO_AUDIT;
	//let index = _.findIndex(pulpLabels, label => label.label != '2');
	//index = index == -1 && _.findIndex(terrorLabels, label => label.label != '0');

	//if (index != -1 || politicianLabels) {
		//auditResult = QINIU_AUDIT_STATE_NOPASS;
	//} else {
		//auditResult = QINIU_AUDIT_STATE_PASS;
	//}

	//return ERR.ERR_OK(auditResult);
//}

//Files.prototype.imageAudit = async function(ctx) {
	//const params = ctx.state.params;

	//const result = await storage.imageAudit(params.key);

	//return ERR.ERR_OK(result);
//}

Files.getRoutes = function() {
	const self = this;
	self.pathPrefix = "files";
	const routes = [
	{
		path: "transform",
		method: "get",
		action: "transform",
	},
	{
		path: "qiniuImport",
		method: "get",
		action: "qiniuImport",
	},
	{
		path: "audit",
		method: "post",
		action: "audit",
	},
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
		path: ":id/raw",
		method: "GET",
		action: "raw",
		validate: {
			params: {
				id: joi.string().required(),
			}
		}
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
		//authentated: true,
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
	//{
		//path: "uploadFile",
		//method: "post",
		//action: "uploadFile",
		//validate: {
			//body: {
				//key: joi.string().required(),
			//}
		//},
		//authentated: true,
	//},
	];

	return routes;
}

export default Files;
