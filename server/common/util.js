import jwt from "jwt-simple";

const filetype = {
	md: "pages",

	jpg: "images",
	jpeg: "images",
	png: "images",
	svg: "images",

	mp4: "vedios",
	webm: "vedios",

	mp3: "audios",
	ogg: "audios",
	wav: "audios",

	unknow: "files",
}
export const util = {};

util.jwt_encode = function(payload, key, expire) {
	payload = payload || {};
	payload.exp = Date.now() / 1000 + (expire || 3600 * 24);

	return jwt.encode(payload, key);
}

util.jwt_decode = function(token, key, noVerify) {
	return jwt.decode(token, key, noVerify);
}

util.getTypeByPath = function(path) {
	const ext = path.substring(path.lastIndexOf(".") + 1);

	return filetype[ext] || "files";
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

export default util;
