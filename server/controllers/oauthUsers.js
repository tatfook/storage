import axios from "axios";
import wurl from "wurl";
import joi from "joi";
import memoryCache from "memory-cache";

import config from "@/config.js";
import models from "@/models";
import Controller from "@/controllers/controller.js";
import ERR from "@@/common/error.js";
import {
	OAUTH_SERVICE_TYPE_QQ,
	OAUTH_SERVICE_TYPE_WEIXIN,
	OAUTH_SERVICE_TYPE_GITHUB,
	OAUTH_SERVICE_TYPE_XINLANG,
} from "@@/common/consts.js";
import util from "@@/common/util.js";

const baseUrl = config.origin + config.baseUrl + "oauthUsers/";

export const OauthUsers = class extends Controller {
	constructor() {
		super();
	}

	async qq(ctx) {
		const accessTokenApiUrl = 'https://graph.qq.com/oauth2.0/token';
		const openidApiUrl = "https://graph.qq.com/oauth2.0/me";
		const userApiUrl = 'https://graph.qq.com/user/get_user_info';
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		params.grant_type = "authorization_code";
		params.client_id = params.client_id || config.oauths.qq.clientId;
		params.client_secret = params.client_secret || config.oauths.qq.clientSecret;
		params.redirect_uri = params.redirect_uri || (baseUrl + "qq");
		//console.log(params);
		// 获取token
		const queryStr = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		const data = wurl("?", "http://localhost/index?" + queryStr);
		const access_token = data.access_token;
		//console.log(data);
		// 获取openid
		let result = await axios.get(openidApiUrl, {params:{access_token}}).then(res => res.data);
		result = result.substring(result.indexOf("(") + 1, result.lastIndexOf(")"));
		result = JSON.parse(result);
		//console.log(result);
		// 获取用户信息
		const externalId = result.openid;
		result = await axios.get(userApiUrl, {params:{
			access_token,
		   	oauth_consumer_key:params.client_id, 
			openid:externalId}}).then(res => res.data);
		console.log(result);
		// 更新DB
		const externalUsername = result.nickname;
		const type = OAUTH_SERVICE_TYPE_QQ;
		//console.log(externalUsername);
		await this.model.upsert({externalId, externalUsername, type, userId});
		let oauthUser = await this.model.findOne({where: {externalId, type}});
		if (!oauthUser) return ERR.ERR();
		oauthUser = oauthUser.get({plain:true});
		//console.log(oauthUser);

		const key = params.code + params.client_id;
		memoryCache.put(key, oauthUser, 1000 * 60 * 10); // 10 分钟

		return ERR.ERR_OK();
	}

	async weixin(ctx) {
		const accessTokenApiUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
		const userApiUrl = 'https://api.weixin.qq.com/sns/userinfo';
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		params.grant_type = "authorization_code";
		params.client_id = params.client_id || config.oauths.weixin.clientId;
		params.appid = params.appid || config.oauths.weixin.appid || config.oauths.weixin.clientId;
		params.secret = params.client_secret || config.oauths.weixin.clientSecret;
		params.redirect_uri = params.redirect_uri || (baseUrl + "weixin");
		//console.log(params);
		// 获取token
		const data = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		//console.log(data);
		const access_token = data.access_token;
		const externalId = data.openid;
		//// 获取用户信息
		let result = await axios.get(userApiUrl, {params:{access_token,	openid:externalId}}).then(res => res.data);
		//console.log(result);
		// 更新DB
		const externalUsername = result.nickname;
		const type = OAUTH_SERVICE_TYPE_WEIXIN;
		//console.log(externalUsername);
		await this.model.upsert({externalId, externalUsername, type, userId});
		let oauthUser = await this.model.findOne({where: {externalId, type}});
		if (!oauthUser) return ERR.ERR();
		oauthUser = oauthUser.get({plain:true});
		//console.log(oauthUser);

		const key = params.code + params.client_id;
		memoryCache.put(key, oauthUser, 1000 * 60 * 10); // 10 分钟

		return ERR.ERR_OK();
	}

	async github(ctx) {
		const accessTokenApiUrl = 'https://github.com/login/oauth/access_token';
		const userApiUrl = 'https://api.github.com/user';
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		//console.log("==================userId=============", userId);
		params.client_id = params.client_id || config.oauths.github.clientId;
		params.client_secret = params.client_secret || config.oauths.github.clientSecret;
		params.redirect_uri = params.redirect_uri || (baseUrl + "github");
		console.log(params);
		
		const queryStr = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		console.log(queryStr);
		const data = wurl("?", "http://localhost/index?" + queryStr);
		if (!data.access_token) return ERR.ERR().setMessage("获取token失败");
		const access_token = data.access_token;
		console.log(data);

		const userinfo = await axios.get(userApiUrl, {params:{access_token}}).then(res => res.data);
		const externalId = userinfo.id;
		const externalUsername = userinfo.login;
		const type = OAUTH_SERVICE_TYPE_GITHUB;

		await this.model.upsert({externalId, externalUsername, type, userId});

		let oauthUser = await this.model.findOne({where: {externalId, type}});
		if (!oauthUser) return ERR.ERR("记录不存在");
		oauthUser = oauthUser.get({plain:true});

		const key = params.code + params.client_id;
		memoryCache.put(key, oauthUser, 1000 * 60 * 10); // 10 分钟

		return ERR.ERR_OK();
	}

	async xinlang(ctx) {
		const accessTokenApiUrl = 'https://api.weibo.com/oauth2/access_token';
		const userApiUrl = 'https://api.weibo.com/2/users/show.json';
		const params = ctx.state.params;
		const userId = ctx.state.user.userId;
		//console.log(params);
		params.grant_type = "authorization_code";
		params.client_id = params.client_id || config.oauths.xinlang.clientId;
		params.client_secret = params.client_secret || config.oauths.xinlang.clientSecret;
		params.redirect_uri = params.redirect_uri || (baseUrl + "xinlang");
		
		//const data = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		const data = await axios.post(`${accessTokenApiUrl}?client_id=${params.client_id}&client_secret=${params.client_secret}&grant_type=authorization_code&code=${params.code}&redirect_uri=${params.redirect_uri}`, params).then(res => res.data);
		if (!data.access_token) return ERR.ERR();
		const access_token = data.access_token;
		const externalId = data.uid;
		//console.log(data);

		const userinfo = await axios.get(userApiUrl, {params:{access_token, uid:externalId}}).then(res => res.data);
		const externalUsername = userinfo.screen_name;
		const type = OAUTH_SERVICE_TYPE_XINLANG;
		//console.log(userinfo);

		await this.model.upsert({externalId, externalUsername, type, userId});

		let oauthUser = await this.model.findOne({where: {externalId, type}});
		if (!oauthUser) return ERR.ERR();
		oauthUser = oauthUser.get({plain:true});

		const key = params.code + params.client_id;
		memoryCache.put(key, oauthUser, 1000 * 60 * 10); // 10 分钟

		return ERR.ERR_OK();
	}

	// 解绑删除记录即可
	
	async token(ctx) {
		const params = ctx.state.params;
		const key = params.code + params.clientId;
		const oauthUser = memoryCache.get(key);
		const userId = ctx.state.user.userId;

		if (!oauthUser) return ERR.ERR();
		
		if (params.state == "bind") {
			oauthUser.token = "oauth user token";
			return  oauthUser;
		}

		// params.state == "login"  登录
		let user = undefined;
		if (!oauthUser.userId) return ERR.ERR().setMessage("账号未绑定");

		const usersModel = models["users"];
		user = await usersModel.findOne({where:{id:oauthUser.userId}});
		if (!user) return ERR.ERR();

		user = user.get({plain: true});

		const rolesModel = models["roles"];
		const roleId = await rolesModel.getRoleIdByUserId(user.id);
		if (rolesModel.isExceptionUser(roleId)) {
			return ERR.ERR_USER_EXCEPTION();
		}
		
		const token = util.jwt_encode({
			roleId: roleId,
			userId: user.id,
			username: user.username,
			oauthUserId: oauthUser.id,
		}, config.secret, config.tokenExpire);

		user.token = token;
		user.roleId = roleId;
		ctx.cookies.set("token", user.token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return user;
	}

	static getRoutes() {
		this.pathPrefix = "oauthUsers";
		const baseRoutes = super.getRoutes();
		const routes = [
		{
			path: "token",
			method: "POST",
			action: "token",
			validate: {
				body: {
					code: joi.string().required(),
					clientId: joi.string().required(),
				},
			},
		},
		{
			path:"xinlang",
			method: "ALL",
			action: "xinlang",
		},
		{
			path:"weixin",
			method: "ALL",
			action: "weixin",
		},
		{
			path:"qq",
			method: "ALL",
			action: "qq",
		},
		{
			path:"github",
			method: "ALL",
			action: "github",
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default OauthUsers;
