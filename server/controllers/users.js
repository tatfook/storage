import _ from "lodash";
import joi from "joi";
import cache from 'memory-cache';
import md5 from "blueimp-md5";
import memoryCache from "memory-cache";

import models from "@/models";
import Controller from "@/controllers/controller.js";

import util from "@@/common/util.js";
import ERR from "@@/common/error.js";
import sendSms from "@@/common/sms.js";
import {sendEmail} from "@@/common/email.js";
import config from "@/config.js";

const userModel = models["users"];

export const Users = class extends Controller {
	constructor() {
		super();
	}

	async update(ctx) {
		const id = ctx.params.id;
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		delete params.password;

		if (id != userId) return ERR.ERR_NO_PERMISSION();

		return await this.model.update(params, {where:{id:userId}});
	}

	async getDetailByUsername(ctx) {
		const params = ctx.state.params;
		const result = await this.model.getByUsername(params.username);
		const userinfo = result.getData();

		if (!userinfo) return result;

		const favoriteModel = models["favorites"];
		const statistics = await favoriteModel.getStatistics(userinfo.id);
		_.merge(userinfo, statistics);

		return ERR.ERR_OK(userinfo);
	}

	async getByUsername(ctx) {
		const params = ctx.state.params;

		const data = await this.model.getByUsername(params.username);

		return data;
	}

	async findById(ctx) {
		const id = ctx.params.id;
		
		const result =  await this.model.findOne({where:{id}});

		return ERR.ERR_OK(result);
	}

	async register(ctx) {
		const params = ctx.state.params;
		const usernameReg = /^[\w\d]+$/;
		if (!usernameReg.test(params.username)) {
			return ERR_PARAMS();
		}
		let user = await this.model.findOne({
			where: {
				username: params.username,
			},
		});
		
		if (user) 	return ERR.ERR().setMessage("用户已存在");

		user = await this.model.create({
			username: params.username,
			password: params.password,
		});

		if (!user) return ERR.ERR();
		user = user.get({plain:true});

		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, config.tokenExpire);

		user.token = token;
		ctx.cookies.set("token", token, {
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return ERR.ERR_OK().setData(user);
	}

	async login(ctx) {
		const params = ctx.state.params;
		let user = await this.model.findOne({
			where: {
				username: params.username,
				password: md5(params.password),
			},
		});
		
		if (!user) {
			return ERR.ERR().setMessage("用户名或密码错误");
		}

		user = user.get({plain:true});

		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, config.tokenExpire);

		user.token = token;
		ctx.cookies.set("token", token, {
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return ERR.ERR_OK().setData(user);
	}

	logout(ctx) {
		ctx.cookies.set("token", "", {
			maxAge: 0,
			overwrite: true,
			domain: "." + config.domain,
		});

		return ERR.ERR_OK();
	}

	async changepwd(ctx) {
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;

		const result = await this.model.update({
			password: params.newpassword,
		}, {
			where: {
				userId: userId,
				password: md5(params.oldpassword),
			}
		});

		if (!result) return ERR.ERR();
		if (result[0] == 0) return ERR.ERR().setMessage("密码错误");

		return ERR.ERR_OK();
	}

	async search(ctx) {
		const params = ctx.state.params;
		const where = {};

		const limit = params.limit && parseInt(params.limit);
		const offset = params.offset && parseInt(params.offset);

		if (params.username) where.username = params.username;

		const result = await this.model.findAll({
			attributes:{
				exclude:["password"],	
			},
			limit,
			offset,
			where,
		});
	
		return ERR.ERR_OK(result);
	}

	async test(ctx) {
		const params = ctx.state.params;
		const pagination = ctx.state.pagination;
		const where = {};
	
		pagination.total = 1;
		
		return ERR.ERR_OK(pagination);
	}

	// 手机验证第一步
	async cellphoneVerifyOne(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const cellphone = params.cellphone;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const ok = await sendSms(cellphone, [captcha, "3分钟"]);
		console.log(captcha, userId);
		memoryCache.put(cellphone, {captcha,userId}, 1000 * 60 * 3); // 10分钟有效期

		return ERR.ERR_OK();
	}
	
	// 手机验证第二步  ==> 手机绑定
	async cellphoneVerifyTwo(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const captcha = params.captcha;
		let cellphone = params.cellphone;
		
		const cache = memoryCache.get(cellphone);
		//console.log(cache, cellphone, captcha, userId);
		if (!cache || cache.captcha != captcha || userId != cache.userId) {
			return ERR.ERR({
				captcha,
				params,
				userId,
			}).setMessage("验证码过期");
		}
		
		if (!params.isBind) cellphone = "";

		const result = await this.model.update({cellphone}, {where:{id:userId}});

		return ERR.ERR_OK(result);
	}

	// 邮箱验证第一步
	async emailVerifyOne(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const email = params.email;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const body = `<h3>尊敬的Note用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
		const ok = await sendEmail(email, "Note 邮箱绑定验证", body);
		console.log(captcha, userId);
		memoryCache.put(email, {captcha,userId}, 1000 * 60 * 10); // 10分钟有效期

		return ERR.ERR_OK();
	}
	
	// 邮箱验证第二步  ==> 手机绑定
	async emailVerifyTwo(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const captcha = params.captcha;
		let email = params.email;
		
		const cache = memoryCache.get(email);
		console.log(cache, email, captcha, userId);
		if (!cache || cache.captcha != captcha || userId != cache.userId) {
			return ERR.ERR({
				captcha,
				params,
				userId,
			}).setMessage("验证码过期");
		}
		
		if (!params.isBind) email = "";

		const result = await this.model.update({email}, {where:{id:userId}});

		return ERR.ERR_OK(result);
	}

	static getRoutes() {
		this.pathPrefix = "users";

		const routes = [
		{
			path: "test",
			method: "GET",
			action: "test",
		},
		{
			path:"getDetailByUsername",
			method: "GET",
			action:"getDetailByUsername",
			validate: {
				query: {
					username: joi.string().required(),
				}
			}
		},
		{
			path:"getByUsername",
			method: "GET",
			action:"getByUsername",
			validate: {
				query: {
					username: joi.string().required(),
				}
			}
		},
		{
			path: "cellphoneVerifyOne",
			method: "GET",
			action: "cellphoneVerifyOne",
			authenticated: true,
			validate: {
				query: {
					cellphone: joi.string().required(),
				},
			}
		},
		{
			path: "cellphoneVerifyTwo",
			method: "POST",
			action: "cellphoneVerifyTwo",
			authenticated: true,
			validate: {
				body: {
					cellphone: joi.string().required(),
					captcha: joi.string().required(),
				},
			}
		},
		{
			path: "emailVerifyOne",
			method: "GET",
			action: "emailVerifyOne",
			authenticated: true,
			validate: {
				query: {
					email: joi.string().required(),
				},
			}
		},
		{
			path: "emailVerifyTwo",
			method: "POST",
			action: "emailVerifyTwo",
			authenticated: true,
			validate: {
				body: {
					email: joi.string().required(),
					captcha: joi.string().required(),
				},
			}
		},
		{
			path: "search",
			method: "GET",
			action: "search",
		},
		{
			path: ":id/changepwd",
			method: ["POST", "PUT"],
			action: "changepwd",
			authenticated: true,
		},
		{
			path: "register",
			method: "post",
			action: "register",
			validate: {
				body: {
					username: joi.string().min(4).max(48).required(),
					password: joi.string().min(4).max(48).required(),
				},
			}
		},
		{
			path: "login",
			method: "post",
			action: "login",
			validate: {
				body: {
					username: joi.string().min(4).max(48).required(),
					password: joi.string().min(4).max(48).required(),
				},
			}
		},
		{
			path: "logout",
			method: "post",
			action: "logout",
			authenticated: true,
		},
		{
			path: ":id",
			method: "GET",
			action: "findById",
			validate: {
				params: {
					id: joi.number().required(),
				},
			}
		},
		{
			path: ":id",
			method: "PUT",
			action: "update",
			authenticated: true,
			validate: {
				params: {
					id: joi.number().required(),
				},
			}
		},
		];

		return routes;
	}
}

export default Users;
