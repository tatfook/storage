import _ from "lodash";
import axios from "axios";
import qiniu from "qiniu";

import config from "@/config.js";
import {ERR, ERR_OK, ERR_PARAMS} from "@@/common/error.js";
import {
	QINIU_AUDIT_STATE_NO_AUDIT,
	QINIU_AUDIT_STATE_PASS,
	QINIU_AUDIT_STATE_NOPASS,
	QINIU_AUDIT_STATE_FAILED,
} from "@@/common/consts.js";

const accessKey = config.qiniu.accessKey;
const secretKey = config.qiniu.secretKey;
const bucketName = config.qiniu.bucketName;
const bucketDomian = config.qiniu.bucketDomian;

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const apiUrlPrefix = config.origin + config.apiUrlPrefix;


const Qiniu = {
}

function getBucketManager() {
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z2;

	return new qiniu.rs.BucketManager(mac, config);
}

Qiniu.getUploadToken = function(key) {
	let scope = bucketName;
	if (key) scope += ":" + key;
	
	const options = {
		scope: scope,
		expires: 3600 * 24, // 一天
		//callbackUrl: config.origin + config.baseURL + "files/qiniu",
		//callbackBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","public":$(x:public),"filename":"$(x:filename)","type":"$(x:type)","sitename":"$(x:sitename)"}',
		//callbackBodyType: 'application/json',
		//returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
	}

	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const putPolicy = new qiniu.rs.PutPolicy(options);
	const token = putPolicy.uploadToken(mac);

	return ERR_OK(token);
}

Qiniu.getDownloadUrl = function(key, expires = 3600 * 24) {
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const config = new qiniu.conf.Config();
	const bucketManager = new qiniu.rs.BucketManager(mac, config);
	const privateBucketDomain = bucketDomian;
	const deadline = parseInt(Date.now() / 1000) + expires; 
	const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);

	return ERR_OK(privateDownloadUrl);
}

Qiniu.upload = async function(key, content) {
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	const putPolicy = new qiniu.rs.PutPolicy({scope: bucketName + ":" + key});
	const token = putPolicy.uploadToken(mac);

	const putExtra = new qiniu.form_up.PutExtra();
	const config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z2; // 华南

	const result = await new Promise((resolve, reject) => {
		const formUploader = new qiniu.form_up.FormUploader(config);
		formUploader.put(token, key, content, putExtra, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				//console.log(respErr, respInfo.statusCode, respBody);
				//return resolve(false);
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			} 

			return resolve(ERR_OK().setData(respBody));
			//return resolve(true);
		});
	});

	return result;
}

Qiniu.delete = async function(key) {
	const bucketManager = getBucketManager();
	
	const result = await new Promise((resolve, reject) => {
		bucketManager.delete(bucketName, key, function(respErr, respBody, respInfo){
			if (respInfo.statusCode != 200 && respInfo.statusCode != 612) {
				//console.log(respErr, respInfo.statusCode, respBody);
				//return resolve(false);
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			
			return resolve(ERR_OK());
			//return resolve(true);
		});
	});

	return result;
}

Qiniu.move = async function(srcKey, dstKey) {
	const bucketManager = getBucketManager();
	
	const result = await new Promise((resolve, reject) => {
		bucketManager.move(bucketName, srcKey, bucketName, dstKey, {force:true}, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				//console.log(respErr, respInfo.statusCode, respBody);
				//return resolve(false);
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			
			return resolve(ERR_OK());
			//return resolve(true);
		});
	});

	return result;
}

Qiniu.batch = async function(ops) {
	const bucketManager = getBucketManager();
	const result = await new Promise((resolve, reject) => {
		bucketManager.batch(ops, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				//console.log(respErr, respInfo.statusCode, respBody);
				//return resolve(false);
				return resolve(ERR().setMessage(respErr).setData({statusCode: respInfo.statusCode, body:respBody}));
			}
			
			return resolve(ERR_OK());
			//return resolve(true);
		});
	});

	return result;
}
Qiniu.batchMove = async function(list) {
	const moveOperations = [];
	for (var i = 0; i < list.length; i++) {
		moveOperations.push(qiniu.rs.moveOp(bucketName, list[i].srcKey, bucketName, list[i].dstKey));
	}

	return await this.batch(moveOperations);
}

Qiniu.batchDelete = async function(list) {
	const bucketManager = getBucketManager();
	const deleteOps = [];
	
	_.each(list, item => deleteOps.push(qiniu.rs.deleteOp(bucketName, item.key)));
	
	return await this.batch(deleteOps);
}

Qiniu.get = async function(key) {
	const url = this.getDownloadUrl(key).getData();

	const content = await axios.get(url).then(res => res.data);
	
	return ERR_OK(content);
}

Qiniu.list = async function(prefix = "", limit = 200, marker) {
	const options = {
		limit: limit,
		prefix: prefix,
		marker: marker,
	}

	const bucketManager = getBucketManager();
	const result = await new Promise((resolve, reject) => {
		bucketManager.listPrefix(bucketName, options, function(respErr, respBody, respInfo){
			if (respErr || respInfo.statusCode != 200) {
				//console.log(respErr, respInfo.statusCode, respBody);
				//return resolve(false);
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

Qiniu.imageAudit = async function(key) {
	const uri = "http://argus.atlab.ai/v1/image/censor";
	//const imgUrl = "http://7xlv47.com1.z0.glb.clouddn.com/pulpsexy.jpg";
	const imgUrl = (key.indexOf("http://") == 0 || key.indexOf("https://") == 0) ? key : this.getDownloadUrl(key).getData();
	const data = {data: {uri:imgUrl}};
	const signed = qiniu.util.generateAccessTokenV2(mac, uri, "POST", "application/json", JSON.stringify(data));
	const result = await axios.request({
		url:uri, 
		method: "POST",
		headers: {
			"Authorization": signed,
			"Content-Type": "application/json",
		},
		data:JSON.stringify(data),
	}).then(res => res.data);

	if (!result || result.code != 0) return QINIU_AUDIT_STATE_FAILED;
	if (result.result.label != 0) return QINIU_AUDIT_STATE_NOPASS;
	return QINIU_AUDIT_STATE_PASS;
}

Qiniu.videoAudit = async function(id, key = "", async = true) {
	const uri = "http://argus.atlab.ai/v1/video/" + (id || 0);
	const videoUrl = (key.indexOf("http://") == 0 || key.indexOf("https://") == 0) ? key : this.getDownloadUrl(key).getData();
	//const videoUrl = "http://oy41jt2uj.bkt.clouddn.com/97eb5420-708a-11e8-aaf9-f9dea1bb2117.mp4?e=2129423642&token=LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq:cny8ZH-tZl4PPMp_sUAn-chowHc=";
	const data = {
		data: {uri:videoUrl}, 
		params: {
			async: async,
			hookURL: apiUrlPrefix + "files/audit",
		},
		ops:[{op:"pulp"}, {op:"terror"}, {op:"politician"}]
	};
	const signed = qiniu.util.generateAccessTokenV2(mac, uri, "POST", "application/json", JSON.stringify(data));
	const result = await axios.request({
		url:uri, 
		method: "POST",
		headers: {
			"Authorization": signed,
			"Content-Type": "application/json",
		},
		data:JSON.stringify(data),
	}).then(res => res.data);
	
	console.log(result);
	return result;
}
export default Qiniu;
