const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const User = class extends Controller {
	get modelName() {
		return "users";
	}

	async show() {
		const {ctx, model} = this;
		const params = this.validate({id: "int"});

		const user = await model.users.getById(params.id);

		return this.success(user);
	}

	async update() {
		const {ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate();

		delete params.id;
		delete params.password;
		delete params.username;

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

		//const roleId = rolesModel.getRoleIdByUserId(user.id);
		//if (rolesModel.isExceptionUser(roleId)) {
			//return ERR.ERR_USER_EXCEPTION();
		//}
		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	async register() {
		const {ctx} = this;
		const {model, util} = this.app;
		const config = this.app.config.self;
		const usernameReg = /^[\w\d]+$/;
		const params = this.validate({
			"username":"string",
			"password":"string",
		});

		if (!usernameReg.test(params.username)) ctx.throw(400);

		let user = await model.users.getByName(params.username);
		if (user) return ctx.throw(400, "用户已存在");

		user = await model.users.create({
			username: params.username,
			password: util.md5(params.password),
		});

		if (!user) return ctx.throw(500);

		user = user.get({plain:true});

		//const roleId = rolesModel.getRoleIdByUserId(user.id);
		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username,
			//roleId: roleId,
		}, config.secret, config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
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
		const {model, cache} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			cellphone:"string",
		});
		const cellphone = params.cellphone;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const ok = await app.sendSms(cellphone, [captcha, "3分钟"]);
		console.log(captcha, userId);
		cache.put(cellphone, {captcha,userId}, 1000 * 60 * 3); // 10分钟有效期

		return this.success();
	}
	
	// 手机验证第二步  ==> 手机绑定
	async cellphoneVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;

		const userId = this.authenticated().userId;
		const params = this.validate({
			cellphone:"string",
			captcha:"string",
		});
		const captcha = params.captcha;
		let cellphone = params.cellphone;
		
		const cache = app.cache.get(cellphone);
		//console.log(cache, cellphone, captcha, userId);
		if (!cache || cache.captcha != captcha || userId != cache.userId) {
			console.log(captcha, params, userId);
			ctx.throw(400, "验证码过期");
		}
		
		if (!params.isBind) cellphone = "";

		const result = await model.users.update({cellphone}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	// 邮箱验证第一步
	async emailVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			email:"string",
		});
		const email = params.email;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const body = `<h3>尊敬的Note用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
		const ok = await app.sendEmail(email, "Note 邮箱绑定验证", body);
		console.log(captcha, userId);
		app.cache.put(email, {captcha,userId}, 1000 * 60 * 10); // 10分钟有效期

		return this.success();
	}
	
	// 邮箱验证第二步  ==> 手机绑定
	async emailVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			email:"string",
			captcha:"string",
		});
		const captcha = params.captcha;
		let email = params.email;
		
		const cache = app.cache.get(email);
		console.log(cache, email, captcha, userId);
		if (!cache || cache.captcha != captcha || userId != cache.userId) {
			ctx.throw(400, "验证码过期");
		}
		
		if (!params.isBind) email = "";

		const result = await model.users.update({email}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	async detail() {
		const {ctx, model, app} = this;
	}

	// 粉丝
	async follows() {
		const {ctx, model, app} = this;
		const userId = this.authenticated().userId;
		const list = await model.favorites.getFollows(userId);

		return list;
	}
}

module.exports = User;
