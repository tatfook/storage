const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const User = class extends Controller {
	get modelName() {
		return "users";
	}

	tokeninfo() {
		return this.success(this.authenticated());
	}

	async index() {
		const query = this.validate();

		this.formatQuery(query);

		const attributes = ["id", "username", "nickname", "portrait", "email"];
		const list = await this.model.users.findAll({...this.queryOptions, attributes, where:query});

		return this.success(list);
	}

	async show() {
		const {ctx, model} = this;
		const {id} = this.validate();

		const userId = _.toNumber(id);
		const user = userId ?  await model.users.getById(userId) :	await model.users.getByName(id);

		if (!user) return this.throw(404);

		return this.success(user);
	}

	async update() {
		const {ctx} = this;
		const {userId, username} = this.authenticated();
		const params = this.validate();

		delete params.id;
		delete params.password;
		delete params.username;
		delete params.roleId;

		const ok = await ctx.model.users.update(params, {where:{id:userId}});

		return this.success(ok && ok[0] == 1);
	}

	async login() {
		const {ctx} = this;
		const {model, util} = this.app;
		const config = this.app.config.self;

		const params = this.validate({
			"username":"string",
			"password":"string",
		});

		let user = await model.users.findOne({
			where: {
				username: params.username,
				password: util.md5(params.password),
			},
		});
		
		if (!user) ctx.throw(400, "用户名或密码错误");
		user = user.get({plain:true});

		//if (model.roles.isExceptionRole(user.roleId)) this.throw(403, "异常用户");

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = util.jwt_encode({
			userId: user.id, 
			roleId: user.roleId,
			username: user.username
		}, config.secret, tokenExpire);

		//console.log(config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	checkCellphoneCaptcha(cellphone, captcha) {
		if (cache.captcha == captcha) return true;

		return false;
	}

	async register() {
		const {ctx} = this;
		const {model, util} = this.app;
		const config = this.app.config.self;
		const usernameReg = /^[\w\d]+$/;
		const params = this.validate({
			//"cellphone":"string",
			//"captcha":"string",
			"username":"string",
			"password":"string",
		});

		if (!usernameReg.test(params.username)) ctx.throw(400);

		let user = await model.users.getByName(params.username);
		if (user) return ctx.throw(400, "用户已存在");

		const cellphone = params.cellphone;
		if (cellphone) {
			const cache = await this.app.model.caches.get(cellphone) || {};
			if (!params.captcha || !cache.captcha || cache.captcha != params.captcha){
				if (!cache.captcha) return this.throw(400, "验证码过期");
				if (cache.captcha != params.captcha) return this.throw(400, "验证码失效");
			} 
			const isBindCellphone = await model.users.findOne({where:{cellphone}});
			if (isBindCellphone) delete params.cellphone;
		}

		user = await model.users.create({
			cellphone: params.cellphone,
			nickname: params.nickname || params.username,
			username: params.username,
			password: util.md5(params.password),
			realname: cellphone,
		});

		if (!user) return ctx.throw(500);
		user = user.get({plain:true});

		const ok = await this.app.api.createGitUser(user);
		if (!ok) {
			await this.model.users.destroy({where:{id:user.id}});
			return this.throw(500, "创建git用户失败");
		}

		if (params.oauthToken) {
			await model.oauthUsers.update({userId:user.id}, {where:{token:params.oauthToken}});
		}

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username,
			roleId: user.roleId,
		}, config.secret, tokenExpire);

		user.token = token;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	logout() {
		const {ctx} = this;
		const config = this.app.config.self;

		ctx.cookies.set("token", "", {
			maxAge: 0,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success();
	}

	async changepwd() {
		const {ctx, util, model} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			password:"string",
			oldpassword:"string",
		});

		const result = await model.users.update({
			password: util.md5(params.password),
		}, {
			where: {
				id: userId,
				password: util.md5(params.oldpassword),
			}
		});

		return this.success(result && result[0] == 1);
	}

	// 手机验证第一步
	async cellphoneVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			cellphone:"string",
		});
		const cellphone = params.cellphone;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const ok = await app.sendSms(cellphone, [captcha, "3分钟"]);
		
		await app.model.caches.put(cellphone, {captcha}, 1000 * 60 * 3); // 10分钟有效期

		if (!ok) return this.throw(500, "请求次数过多");
		//console.log(captcha);
		return this.success();
	}
	
	// 手机验证第二步  ==> 手机绑定
	async cellphoneVerifyTwo() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			cellphone:"string",
			captcha:"string_optional",
			password: "string_optional",
		});
		let cellphone = params.cellphone;
		// 解绑有密码 优先密码验证
		if (!params.isBind && params.password) {
			const ok = await this.model.users.update({cellphone: null}, {where:{id:userId, password: this.util.md5(params.password)}});
			return this.success(ok);
		}
		
		const captcha = params.captcha;
		const cache = await this.model.caches.get(cellphone);
		//console.log(cache, cellphone, captcha, userId);
		if (!captcha || !cache || cache.captcha != captcha) {
			if (!cache) this.throw(400, "验证码过期");
			if (!captcha || cache.captcha != captcha) return this.throw(400, "验证码错误" + cache.captcha + "-" + captcha);
		}
		
		if (params.realname) {
			return await this.model.users.update({realname: cellphone}, {where:{id:userId}});
		}

		if (!params.isBind) cellphone = "";

		return await this.model.users.update({cellphone}, {where:{id:userId}});
	}

	// 邮箱验证第一步
	async emailVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			email:"string",
		});
		const email = params.email;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const body = `<h3>尊敬的KEEPWORK用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
		const ok = await app.sendEmail(email, "KEEPWORK 邮箱绑定验证", body);
		//console.log(captcha);
		await app.model.caches.put(email, {captcha}, 1000 * 60 * 10); // 10分钟有效期

		return this.success();
	}
	
	// 邮箱验证第二步  ==> 手机绑定
	async emailVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			email:"string",
			captcha:"string_optional",
			password: "string_optional",
		});

		let email = params.email;

		// 解绑有密码 优先密码验证
		if (!params.isBind && params.password) {
			const ok = await this.model.users.update({email: null}, {where:{id:userId, password: this.util.md5(params.password)}});
			return this.success(ok);
		}
		const captcha = params.captcha;
		
		const cache = await app.model.caches.get(email);
		//console.log(cache, email, captcha, userId);
		if (!captcha || !cache || cache.captcha != captcha) {
			if (!cache) ctx.throw(400, "验证码过期");
			if (!captcha || cache.captcha != captcha) return ctx.throw(400, "验证码错误");
		}
		
		if (!params.isBind) email = null;

		const result = await model.users.update({email}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	async profile() {
		const {userId} = this.authenticated();

		const user = await this.model.users.getById(userId);
		
		return this.success(user);
	}

	async detail() {
		const {id} = this.validate({id:'int'});
		const user = await this.model.users.getById(id);
		if (!user) this.throw(400);
		
		user.siteCount = await this.model.sites.getCountByUserId(id);
	}

	async sites() {
		const {id} = this.validate();
		const user = await this.model.users.get(id);

		if (!user) return this.success([]);

		const userId = user.id;
		const sites = await this.model.sites.get(userId);
		const joinSites = await this.model.sites.getJoinSites(userId, 0);

		return this.success(sites.concat(joinSites));
	}
}

module.exports = User;
