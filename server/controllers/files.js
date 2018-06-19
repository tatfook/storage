import _ from "lodash";
import joi from "joi";
import axios from "axios";
import Sequelize from "sequelize";
import sequelize from "@/models/database.js";

import config from "@/config.js";
import ERR from "@/common/error.js";
import util from "@/common/util.js";
import {
	QINIU_AUDIT_STATE_NO_AUDIT,
	QINIU_AUDIT_STATE_PASS,
	QINIU_AUDIT_STATE_NOPASS,
	QINIU_AUDIT_STATE_FAILED,
} from "@/common/consts.js";

import storage from "./storage.js";

import filesModel from "@/models/files.js";


const {like, gt, lte, ne, in: opIn} = Sequelize.Op;

export const Files = function(){
	this.model = filesModel;
}


Files.prototype.raw = function(ctx) {
	const params = ctx.state.params;
	const filename = params.filename;
	const key = util.getKeyByPath(filename);

	const url = storage.getDownloadUrl(key).getData();
	console.log(url);

	ctx.redirect(url);
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

	if (await storage.isFull(username)) {
		return ERR.ERR().setMessage("存贮空间不足");
	}

	const result =  storage.getUploadToken(key);
	if (result.isErr()) return result;

	const token = result.getData();
	
	return ERR.ERR_OK({token});
}


Files.prototype.statistics = async function(ctx) {
	const username = ctx.state.user.username;

	let data = await storage.getStatistics({username: username});

	return ERR.ERR_OK(data);
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

	await storage.updateStatistics(username);

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

	await storage.updateStatistics(username);

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
	//const srcKey = username + "_files/" + data.filename;
	//const dstKey = username + "_files/" + filename;
	//data = await storage.move(srcKey, dstKey);
	//if (data.isErr()) return data;
	
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

	const value = (val) => val == "null" ? undefined : val;
	const type = util.getTypeByPath(key);
	let checked = QINIU_AUDIT_STATE_NO_AUDIT;
	if (type == "images") {
		checked = await storage.imageAudit(key);
	}

	let data = await this.model.upsert({
		username: username,
		type: type,
		checked: checked,
		key:params.key,
		hash: params.hash,
		size: params.size,
		sitename: value(params.sitename),
		filename: value(params.filename),
	});
	
	// 添加记录失败 应删除文件
	if (type == "videos") {
		data = await this.model.findOne({where: {key:key}});
		if (!data) return ERR.ERR();
		data = data.get({plain:true});
		storage.videoAudit(util.aesEncode({id:data.id}), key);
	}

	return ERR.ERR_OK(data);
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

Files.prototype.videoAudit = async function(ctx) {
	const params = ctx.state.params;
	const result = await storage.videoAudit(params.id || 0, params.key, false);
	const pulpLabels = result.pulp.labels;
	const terrorLabels = result.terror.labels;
	const politicianLabels = result.politician.labels;
	let auditResult = QINIU_AUDIT_STATE_NO_AUDIT;
	let index = _.findIndex(pulpLabels, label => label.label != '2');
	index = index == -1 && _.findIndex(terrorLabels, label => label.label != '0');

	if (index != -1 || politicianLabels) {
		auditResult = QINIU_AUDIT_STATE_NOPASS;
	} else {
		auditResult = QINIU_AUDIT_STATE_PASS;
	}

	return ERR.ERR_OK(auditResult);
}

Files.prototype.imageAudit = async function(ctx) {
	const params = ctx.state.params;

	const result = await storage.imageAudit(params.key);

	return ERR.ERR_OK(result);
}

Files.prototype.importOldData = async function(ctx) {
	const params = ctx.state.params;
	const self = this;

	const apiUrl = params.apiUrl || (config.keepworkBaseURL + 'tabledb/query');
	const data = {
		tableName: "qiniu_files",
		query: {},
		pageSize: 1000000,
	}

	const result = await axios.post(apiUrl, data, {headers:	{"Authorization":"Bearer eyJhbGciOiJNRDUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlSWQiOjEwLCJleHAiOjE1Mjk3NTY2MTgsImlzQWRtaW4iOnRydWUsInVzZXJJZCI6MTIsInVzZXJuYW1lIjoieGlhb3lhbyJ9.TkRobVlUTmhNV1ZqTkRFd1ltUTJOamM1T0RneE9XTXlaRE0yTVRoall6az0"}}).then(res => res.data);
	
	const list = result.data.data || [];
	for (let i = 0; i < list.length; i++){
		let item = list[i];
		await self.model.upsert({
			id: item._id,
			key: item.key,
		    username: item.username,
			filename: item.filename,
			checked: item.checked,
			type: util.getTypeByPath(item.key),
			size: item.size,
		});
	}
	console.log(result);
	return result;
}

Files.prototype.test = async function(ctx) {
	const params = ctx.state.params;
	//await storage.getSigned(params.key);
	//const result = await storage.imageAudit(params.key);
	
	const data = {id:1, username:"xiaoyao"};
	const ciphertext = util.aesEncode(data, config.secret);
	const decryptData = util.aesDecode(ciphertext, config.secret);
	console.log(decryptData);
	await storage.videoAudit(ciphertext, "test", false);


	return {key:"test"};
}

Files.getRoutes = function() {
	const self = this;
	self.pathPrefix = "files";
	const routes = [
	{
		path: "test",
		method: "get",
		action: "test",
	},
	{
		path: "importOldData",
		method: "get",
		action: "importOldData",
	},
	{
		path: "imageAudit",
		method: "get",
		action: "imageAudit",
		validate: {
			query: {
				key: joi.string().required(),
			},
		},
	},
	{
		path: "videoAudit",
		method: "get",
		action: "videoAudit",
		validate: {
			query: {
				key: joi.string().required(),
			},
		},
	},
	{
		path: "qiniu",
		method: "post",
		action: "qiniu",
	},
	{
		path: "audit",
		method: "post",
		action: "audit",
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
