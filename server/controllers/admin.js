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

export const Admin = function(){
}

Admin.prototype.raw = async function(ctx) {
	let id = ctx.params.id;
	let data = await filesModel.findOne({where:{id:id}});
	if (!data) return ERR.ERR_PARAMS();

	data = data.get({plain:true});
	const url = storage.getDownloadUrl(data.key).getData();
	return ERR.ERR_OK(url);
}

Admin.prototype.search = async function(ctx) {
	return await this.find(ctx);
}

Admin.prototype.find = async function(ctx) {
	const params = ctx.state.params;
	const options = {};
	options.limit = params.limit && parseInt(params.limit);
	options.offset = params.offset && parseInt(params.offset);
	if (params.order) options.order = params.order;
	delete params.order;
	delete params.limit;
	delete params.offset;
	options.where = params || {};

	const list = await filesModel.findAndCountAll(options);

	return ERR.ERR_OK(list);
}

Admin.prototype.findOne = function() {

}

Admin.prototype.delete = async function(ctx) {
	const params = ctx.state.params;
	const options = {};
	options.where = params || params;

	let data = await filesModel.findOne(options);
	if (!data) return;

	data = data.get({plain:true});
	await storage.delete(data.key);

	const result = await filesModel.destroy(options);
	return ERR.ERR_OK(result);
}

Admin.prototype.upsert = async function(ctx) {
	const params = ctx.state.params;

	const result = await filesModel.upsert(params);

	return ERR.ERR_OK(result);
}

Admin.getRoutes = function() {
	const self = this;
	self.pathPrefix = "admin/files";
	const routes = [
	{
		path: ":id/raw",
		method: "GET",
		action: "raw",
		admin: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		},
	},
	{
		path: "search",
		method: ["POST", "GET"],
		action: "search",
		admin: true,
	},
	{
		path: "",
		method: "POST",
		action: "upsert",
		admin: true,
		validate: {
			body: {
				key: joi.string().required(),
			},
		},
	},
	{
		path: ":id",
		method: "PUT",
		action: "upsert",
		admin: true,
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
		admin: true,
		validate: {
			params: {
				id: joi.string().required(),
			}
		},
	},
	{
		path: ":id",
		method: "GET",
		action: "findOne",
		admin: true,
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
		admin: true,
	},
	];

	return routes;
}

export default Admin;
