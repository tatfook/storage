
module.exports = app => {
	const {router, config,  controller} = app;
	const selfConfig = config.self;

	const prefix = selfConfig.apiUrlPrefix;

	const index = controller.index;
	router.resources(`${prefix}indexs`, index);

	const user = controller.user;
	//router.get(`${prefix}users/follows`, user.follows);
	//router.get(`${prefix}users/detail`, user.detail);
	router.post(`${prefix}users/register`, user.register);
	router.post(`${prefix}users/login`, user.login);
	router.post(`${prefix}users/logout`, user.logout);
	router.put(`${prefix}users/pwd`, user.changepwd);
	router.get(`${prefix}users/email_captcha`, user.emailVerifyOne);
	router.post(`${prefix}users/email_captcha`, user.emailVerifyTwo);
	router.get(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyOne);
	router.post(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyTwo);
	router.resources(`${prefix}users`, user);

	const site = controller.site;
	router.get(`${prefix}sites/:id/privilege`, site.privilege);
	router.post(`${prefix}sites/:id/groups`, site.postGroups);
	router.put(`${prefix}sites/:id/groups`, site.putGroups);
	router.delete(`${prefix}sites/:id/groups`, site.deleteGroups);
	router.get(`${prefix}sites/:id/groups`, site.getGroups);
	router.resources(`${prefix}sites`, site);

	const page = controller.page;
	router.get(`${prefix}pages/visit`, page.visit);
	router.resources(`${prefix}pages`, page);

	const group = controller.group;
	router.post(`${prefix}groups/:id/members`, group.postMembers);
	router.delete(`${prefix}groups/:id/members`, group.deleteMembers);
	router.get(`${prefix}groups/:id/members`, group.getMembers);
	router.resources(`${prefix}groups`, group);

	const groupMember = controller.groupMember;
	router.resources(`${prefix}groupMembers`, groupMember);

	const siteGroup = controller.siteGroup;
	router.resources(`${prefix}siteGroups`, siteGroup);

	const domain = controller.domain;
	router.get(`${prefix}domains/exist`, domain.exist);
	router.resources(`${prefix}domains`, domain);

	//const file = controller.file;
	//router.post(`${prefix}files/upsert`, file.upsert);
	//router.get(`${prefix}files/:id/token`, file.token);
	//router.resources(`${prefix}files`, file);

	//const favorite = controller.favorite;
	//router.get(`${prefix}favorites/exist`, favorite.exist);
	//router.resources(`${prefix}favorites`, favorite);

	const oauthUser = controller.oauthUser;
	router.post(`${prefix}oauth_users/qq`, oauthUser.qq);
	router.post(`${prefix}oauth_users/weixin`, oauthUser.weixin);
	router.post(`${prefix}oauth_users/github`, oauthUser.github);
	router.post(`${prefix}oauth_users/xinlang`, oauthUser.xinlang);
	router.resources(`${prefix}oauth_users`, oauthUser);

	const comment = controller.comment;
	router.resources(`${prefix}comments`, comment);
}
