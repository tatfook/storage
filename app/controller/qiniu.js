const _ = require("lodash");
const qiniu = require("qiniu");

const Controller = require("../core/controller.js");

const Qiniu = class extends Controller {
	async token() {
		const {userId} = this.authenticated();
		const {key} = this.validate({key:"string"});
		const config = this.config.self.qiniuPublic;
		const options = {
			scope: config.bucketName + ":" + key,
			expires: 3600 * 24, // 一天
			returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
		}
		const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return this.success(token);
	}
}

module.exports = Qiniu;
