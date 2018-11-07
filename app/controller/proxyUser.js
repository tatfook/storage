

const _ = require("lodash");

const Controller = require("../core/controller.js");

const ProxyUser = class extends Controller {
	

	async login() {
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
		const token = util.jwt_encode({
			userId: user.id, 
			roleId: user.roleId,
			username: user.username
		}, config.secret, tokenExpire);

		user.token = token;

		return this.success({message:"OK", id:0}, {userinfo:user, token});
	}


	async register() {
		const {username, password} = this.validate({
			username: "string",
			password: "string",
		});
		const usernameReg = /^[\w\d]{4,30}$/;
		if (!usernameReg.test(username)) return this.success({error:{id:-1, message:"用户名不合法"}});
		let user = await this.model.users.getByName(username);
		if (user) return this.success({error:{id:-1, message:"用户已存在"}});
	}
}

module.exports = ProxyUser;
