const joi = require("joi");
const _ = require("lodash");
const Base64 = require("js-base64").Base64;

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

function ERR(code, data) {
	return {code, data};
}

const File = class extends Controller {
	get modelName() {
		return "files";
	}

	get storage() {
		return this.app.storage;
	}

	ERR(code, data) {
		return ERR(code, data);
	}

	getTypeByMimeType(mimeType) {
		const type = mimeType.split("/")[0];
		if (type == "image" || type == "audio" || type == "video") return type + "s";

		return "files";
	}

	aesEncode(data, key) {
		return Base64.encode(CryptoJS.AES.encrypt(JSON.stringify(data), key).toString());
	}

	aesDecode(data, key) {
		data = Base64.decode(data);
		const bytes = CryptoJS.AES.decrypt(data, key);
		try {
			return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		} catch(e) {
			return {};
		}
	}

	getTypeByPath(path) {
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

		const ext = path.substring(path.lastIndexOf(".") + 1);

		return filetype[ext.toLowerCase()] || "files";
	}

	async rawurl() {
		const {id} = this.validate({id:"int"});
		const {userId} = this.authenticated();
		const where = {id, userId};

		let data = await this.model.files.findOne({where});
		if (!data) return this.ERR(-1);

		data = data.get({plain:true});
		const url = storage.getDownloadUrl(data.key, 3600 * 24 * 365 * 100);

		return this.ERR(0, url);
	}

	async token() {
		const {userId} = this.authenticated();
		const params = this.validate({id:"string"});
		const key = decodeURIComponent(params.id);

		if (await this.model.storages.isFull(userId)) {
			return ERR.ERR().setMessage("存贮空间不足");
		}

		const token =  this.storage.getUploadToken(key);

		await this.model.upsert({userId, key});

		return ERR(0, {token});
	}

	async statistics() {
		const {userId} = this.authenticated();

		const data = await this.model.storages.getStatistics(userId);

		return ERR(0, data);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({key:"string"});
		params.userId = userId;

		const data = await this.model.files.upsert(params);

		return ERR(0, data);
	}

	async destroy() {
		const {id} = this.validate({id:"int"});
		const {userId} = this.authenticated();
		const where = {id, userId};

		let data = await this.model.files.findOne({where});
		if (!data) return ERR(-1);

		data = data.get({plain:true});
		const key = data.key;

		// 删除七牛文件 
		data = await this.storage.delete(key);
		//if (!data) return ERR(-1);

		data = await this.model.files.destroy({where});
		//await storage.updateStatistics(userId);

		return ERR(0, data);
	}

	async show() {
		const {id} = this.validate({id:"int"});
		const {userId} = this.authenticated();

		let data = await this.model.files.findOne({
			where: {
				id:id,
				userId,
			}
		})

		return ERR(0, data);
	}

	async index() {
		const {userId} = this.authenticated();
		const params = this.validate();

		const where = {userId};
		
		if (params.type) where.type = params.type;
		where.size = {[gt]:0};

		let data = await this.model.files.findAll({
			where: where,
			limit: params.limit,
			offset: params.offset,
		});

		return ERR(0, data);
	}

	async list() {
		const {userId} = this.authenticated();
		const params = this.validate();
		const siteId = params.siteId && parseInt(params.siteId);

		const where = {
			size: {[gt]:0},
			userId: userId,
		};

		if (params.type) where.type = params.type;
		const result = await this.model.files.findAll({
			where,
			limit: params.limit,
			offset: params.offset,
		});

		const list = [];
		for (let i = 0; i < result.length; i++) {
			let item = result[i].get({plain:true});
			item.downloadUrl = this.storage.getDownloadUrl(item.key);
			if (siteId) {
				let siteFile = await this.model.siteFiles.findOne({where: {fileId: item.id, siteId}});
				if (siteFile) {
					item.url = "/api/v0/siteFiles/" + siteFile.id + "/raw";
				}
			}
			list.push(item);
		}

		return ERR(0, list);
	}

	async qiniu() {
		const params = this.validate();
		const key = params.key;
		const mimeType = params.mimeType;
		let type = mimeType ? this.getTypeByMimeType(mimeType) : this.getTypeByPath(key);
		let checked = QINIU_AUDIT_STATE_PASS;

		//if (type == "images") {
			//checked = await storage.imageAudit(key);
		//}

		console.log(params);

		let data = await this.model.files.upsert({
			type: type,
			checked: checked,
			key: key,
			hash: params.hash,
			size: params.size,
			filename: params.filename,
		});
		
		// 添加记录失败 应删除文件
		//if (type == "videos") {
			//data = await this.model.findOne({where: {key:key}});
			//if (!data) return ERR.ERR();
			//data = data.get({plain:true});
			//storage.videoAudit(util.aesEncode({id:data.id}), key);
		//}

		console.log("-----------qiniu callback finish-------------");
		return ERR(0, data);
	}

	async audit() {
		const params = this.validate();
		console.log(params);
		// id 需加密解密
		const data = this.aesDecode(params.id, this.app.config.self.secret);
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

		let ok = await this.model.files.update({
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

	async videoAudit() {
		const params = this.validate();
		console.log(params);
		const result = await this.storage.videoAudit(params.id || 0, params.key, false);
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

		return ERR(0, auditResult);
	}

	async imageAudit() {
		const params = this.validate();

		const result = await this.storage.imageAudit(params.key);

		return ERR(0, result);
	}
}

module.exports = File;
