
const axios = require("axios");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const ProxyUser = class extends Controller {
	
	// 登录
	async login() {
		const config = this.config.self;
		const {username, password} = this.validate({
			username: "string",
			password: "string",
		});

		let user = await this.model.users.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: this.app.util.md5(password),
			}
		});

		if (!user) return this.success({error:{id:-1, message:"用户名密码错误"}});
		user = user.get({plain:true});

		//if (model.roles.isExceptionRole(user.roleId)) this.throw(403, "异常用户");

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, tokenExpire);

		user.token = token;
		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {username:user.username};
		if (user.realname) user.realNameInfo = {cellphone: user.realname, verified: user.realname ? true : false};

		return this.success({
			error:{id:0, message:"OK"},
			data: {token: token, userinfo: user},
		});
	}

	// 注册
	async register() {
		const config = this.config.self;
		const {username, password} = this.validate({
			username: "string",
			password: "string",
		});
		const usernameReg = /^[\w\d]{4,30}$/;
		const words = await this.app.ahocorasick.check(username);
		if (words.length) return this.success({error:{id:-1, message:"包含铭感词", data:words}});
		if (!usernameReg.test(username)) return this.success({error:{id:-1, message:"用户名不合法"}});
		let user = await this.model.users.getByName(username);
		if (user) return this.success({error:{id:-1, message:"用户已存在"}});

		const data = await axios.post(config.keepworkBaseURL + "user/register", {username, password}).then(res => res.data).catch(e => {
			console.log("创建wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data);
		
		user = await this.model.users.create({username, password:this.app.util.md5(password)});
		if (!user) return this.success({error:{id:-1, message:"服务器内部错误"}});

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			username: user.username,
		}, config.secret, tokenExpire);

		const ok = await this.app.api.createGitUser(user);
		if (!ok) {
			await this.model.users.destroy({where:{id:user.id}});
			return this.success({error:{id:-1, message:"创建git用户失败"}});
		}
		await this.app.api.createGitProject({
			username: user.username,
			sitename: '__keepwork__',
			visibility: 'public',
		});

		user.token = token;
		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {username:user.username};
		delete user.password;

		return this.success({
			error:{id:0, message:"OK"},
			data: {token: token, userinfo: user},
		});
	}

	// profile
	async profile() {
		const {userId} = this.authenticated();	

		const user = await this.model.users.findOne({where:{id: userId}});

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});

		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {username:user.username};
		if (user.realname) user.realNameInfo = {cellphone: user.realname, verified: user.realname ? true : false};
		delete user.password;

		return this.success({error:{id:0, message:"OK"}, data:user});
	}

	// getBaseInfoByName
	async getBaseInfoByName() {
		const {username} = this.validate({username:"string"});
		const user = await this.model.users.getByName(username);

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});
		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {username:user.username};

		return this.success({error:{id:0, message:"OK"}, data:user});
	}
}

module.exports = ProxyUser;
