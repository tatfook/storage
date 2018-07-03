import axios from "axios";
import qiniu from "qiniu";
const uuidv1 = require('uuid/v1');
import config from "../config.js";
import {ERR, ERR_OK, ERR_PARAMS} from "../../common/error.js";

import filesModel from "../models/files.js";

const accessKey = config.qiniu.accessKey;
const secretKey = config.qiniu.secretKey;
const bucketName = config.qiniu.bucketName;
const bucketDomian = config.qiniu.bucketDomian;

export const Qiniu = function() {
}

function getUploadToken(opt = {}) {
	let scope = bucketName;

	if (opt.key) scope += ":" + opt.key;
	const options = {
		scope: scope,
		expires: opt.expires,
		returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
	};

	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const putPolicy = new qiniu.rs.PutPolicy(options);
	const token = putPolicy.uploadToken(mac);

	return token;
}

function getBucketManager() {
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z2;

	return new qiniu.rs.BucketManager(mac, config);
}

// 获取文件内容
Qiniu.prototype.get = async function(ctx) {
	const params = ctx.state.params;
	const key = params.key;
	const downloadUrl = this.getDownloadUrl(key);

	const content = await axios.get(downloadUrl).then(res => res.data);

	return ERR_OK(content);
}

// 移动或重命名文件
Qiniu.prototype.move = async function(ctx) {
	const params = ctx.request.body || {};

	if (!params.srcKey || !params.dstKey) {
		return ERR_PARAMS();
	}

	const bucketManager = getBucketManager();
	const result = await new Promise((resolve, reject) => {
		bucketManager.move(bucketName, params.srcKey, bucketName, params.dstKey, {force:true}, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			
			return resolve(ERR_OK());
		});
	});

	return result;
}

// 删除文件
Qiniu.prototype.delete = async function(ctx) {
	const params = ctx.state.params;
	if (!params.key) {
		return ERR_PARAMS();
	}
	
	const bucketManager = getBucketManager();
	const result = await new Promise((resolve, reject) => {
		bucketManager.delete(bucketName, params.key, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			
			return resolve(ERR_OK());
		});
	});

	return result;
}

// 获取文件列表
Qiniu.prototype.list = async function(ctx) {
	const params = ctx.state.params;

	const options = {
		limit: params.limit || 200,
		prefix: params.prefix || "",
		marker: params.marker,
	}

	const bucketManager = getBucketManager();
	const result = await new Promise((resolve, reject) => {
		bucketManager.listPrefix(bucketName, options, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			return resolve(ERR_OK().setData({
				marker: respBody.marker,
				prefix: respBody.commonPrefixes,
				items: respBody.items,
			}));
		});
	});

	return result;
}

// 上传 MD IMG 小文件
Qiniu.prototype.upload = async function(ctx) {
	const params = ctx.state.params;

	const config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z2; // 华南

	const formUploader = new qiniu.form_up.FormUploader(config);
	const putExtra = new qiniu.form_up.PutExtra();
	const uploadToken = getUploadToken(params);

	const result = await new Promise((resolve, reject) => {
		formUploader.put(uploadToken, params.key, params.content, putExtra, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			} 

			return resolve(ERR_OK().setData(respBody));
		});
	});

	return result;
}

Qiniu.prototype.getUid = function(ctx) {
	const uid = uuidv1();
	return ERR_OK().setData({uid:uid});
}

// 获取指定key的上传token
//Qiniu.prototype.getUploadTokenByKey = function(ctx) {
	//const params = ctx.state.params;
	//if (!params.key) {
		//return ERR_PARAMS();
	//}
	//const options = {
		//scope: bucketName + ":" + params.key,
		////expires: 3600 * 24 * 365, // 默认一个小时
		////callbackUrl: config.QiniuService.baseURL + "qiniu/callback",
		////callbackBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","uid":"$(x:uid)"}',
		////callbackBodyType: 'application/json',
	//}

	//if (params.key.indexOf("note/") == 0) {
		//options.callbackUrl = options.callbackBody = options.callbackBodyType = undefined;
	//}

	//const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	//const putPolicy = new qiniu.rs.PutPolicy(options);
	//const token = putPolicy.uploadToken(mac);

	//return ERR_OK().setData(token);
//}

Qiniu.prototype.getUploadToken = function(ctx) {
	const params = ctx.state.params || {};
	let scope = bucketName;
	if (params.key) scope += ":" + params.key;
	
	const options = {
		scope: scope,
		expires: 3600 * 24, // 一天
		//callbackUrl: config.origin + config.baseURL + "qiniu/callback",
		//callbackBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","public":"$(x:public)","filename":"$(x:filename)","path":"$(x:path)"}',
		//callbackBodyType: 'application/json',
		//returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
	}

	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const putPolicy = new qiniu.rs.PutPolicy(options);
	const token = putPolicy.uploadToken(mac);

	return ERR_OK().setData(token);
}

Qiniu.prototype.getDownloadUrl = function(key, expires = 3600 * 24) {
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const config = new qiniu.conf.Config();
	const bucketManager = new qiniu.rs.BucketManager(mac, config);
	const privateBucketDomain = bucketDomian;
	const deadline = parseInt(Date.now() / 1000) + expires; 
	const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);

	return privateDownloadUrl;
}

Qiniu.prototype.api_getDownloadUrl = function(ctx) {
	const params = ctx.state.params;
	const key = params.key;
	if (!key) {
		return ERR_PARAMS();
	}

	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const config = new qiniu.conf.Config();
	const bucketManager = new qiniu.rs.BucketManager(mac, config);
	const privateBucketDomain = bucketDomian;
	const deadline = parseInt(Date.now() / 1000) + (parseInt(params.expires || "") || (3600 * 24 * 365)); 
	const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);
	//console.log(privateDownloadUrl);
	return  ERR_OK().setData(privateDownloadUrl);
}

Qiniu.prototype.callback = async function(ctx) {
	const params = ctx.request.body;
	const {key} = params;
	const username = key.split("/")[0].replace(/\_files$/, "");
	//console.log(params);

	let data = await filesModel.upsert({
		username: username,
		key:params.key,
		hash: params.hash,
		size: params.size,
		type: params.type,
		path: params.path == "null" ? undefined : params.path,
		filename: params.filename == "null" ? undefined : params.filename,
		public: params.public == "null" ? undefined : params.public,
	}, {
		where: {
			key:key,
		},
	})
	
	// 添加记录失败 应删除文件
	if (!data) {
	}

	return ERR_OK(data);
}

Qiniu.getRoutes = function() {
	this.pathPrefix = "qiniu";
	const routes = [
	{
		path: "get",
		method: "get",
		action: "get",
	},
	{
		path: "list",
		method: "get",
		action: "list",
	},
	{
		path: "upload",
		method: "post",
		action: "upload",
	},
	{
		path: "getUid",
		method: "get",
		action: "getUid",
	},
	{
		path: "getUploadTokenByKey",
		method: "get",
		action: "getUploadTokenByKey",
	},
	{
		path: "getUploadToken",
		method: "get",
		action: "getUploadToken",
	},
	{
		path: "callback",
		method: "post",
		action: "callback",
	},
	{
		path: "getDownloadUrl",
		method: "get",
		action: "getDownloadUrl",
	},
	];

	return routes;
}


export default Qiniu;
