import jwt from "jwt-simple";
import CryptoJS from "crypto-js";
import {Base64} from "js-base64";

const filetype = {
	md: "pages",

	gif: "images",
	bmp: "images",
	jpg: "images",
	jpeg: "images",
	png: "images",
	svg: "images",

	mp4: "videos",
	webm: "videos",

	mp3: "audios",
	ogg: "audios",
	wav: "audios",

	unknow: "files",
}
export const util = {};

util.jwt_encode = function(payload, key, expire, alg="HS256") {
	payload = payload || {};
	payload.exp = Date.now() / 1000 + (expire || 3600 * 24);

	return jwt.encode(payload, key, alg);
}

util.jwt_decode = function(token, key, noVerify, alg="HS256") {
	return jwt.decode(token, key, noVerify, alg);
}

util.getTypeByMimeType = function(mimeType) {
	const type = mimeType.split("/")[0];
	if (type == "image" || type == "audio" || type == "video") return type + "s";

	return "files";
}

util.getTypeByPath = function(path) {
	const ext = path.substring(path.lastIndexOf(".") + 1);

	return filetype[ext.toLowerCase()] || "files";
}

util.getKeyByPath = function(path) {
	const paths = path.split("/");
	if (paths.length < 2) return path;

	const filename = paths[paths.length-1];
	const ext = filename.split(".")[1] || "unknow";
	if (ext == "md") return path;

	const type = filetype[ext] || "files";
	paths[0] = paths[0] + "_" + type;

	return paths.join("/");
	//return paths.splice(1,0, type).join('/');
	
}

util.getPathByKey = function(key) {
	const paths = key.split("/");
	if (paths.length < 2) return key;

	paths[0] = paths[0].split("_")[0];

	return paths.join('/');
	//const paths =key.split("/");
	//if (paths.length < 3) return key;

	//paths.splice(1.1);

	//return paths.join("/"); 
}

util.aesEncode = function(data, key) {
	return Base64.encode(CryptoJS.AES.encrypt(JSON.stringify(data), key).toString());
}

util.aesDecode = function(data, key) {
	data = Base64.decode(data);
	const bytes = CryptoJS.AES.decrypt(data, key);
	try {
		return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
	} catch(e) {
		return {};
	}
}

export default util;
