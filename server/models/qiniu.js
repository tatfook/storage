import axios from "axios";
import qiniu from "qiniu";
import config from "@/config.js";
import {ERR, ERR_OK, ERR_PARAMS} from "@/common/error.js";

const accessKey = config.qiniu.accessKey;
const secretKey = config.qiniu.secretKey;
const bucketName = config.qiniu.bucketName;
const bucketDomian = config.qiniu.bucketDomian;


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
		callbackUrl: config.origin + config.apiUrlPrefix + "files/qiniu",
		//callbackBody: '{"hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)"}',
		callbackBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","public":$(x:public),"filename":"$(x:filename)","type":"$(x:type)","sitename":"$(x:sitename)"}',
		callbackBodyType: 'application/json',
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

export default Qiniu;
