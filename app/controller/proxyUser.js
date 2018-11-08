

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
		if (!usernameReg.test(username)) return this.success({error:{id:-1, message:"用户名不合法"}});
		let user = await this.model.users.getByName(username);
		if (user) return this.success({error:{id:-1, message:"用户已存在"}});

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

		user.token = token;
		user.displayName = user.nickname;
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
		delete user.password;

		return this.success({error:{id:0, message:"OK"}, data:user});
	}
}

module.exports = ProxyUser;
