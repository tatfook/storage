
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
	router.post(`${prefix}users/changepwd`, user.changepwd);
	router.post(`${prefix}users/emailVerifyOne`, user.emailVerifyOne);
	router.post(`${prefix}users/emailVerifyTwo`, user.emailVerifyTwo);
	router.post(`${prefix}users/cellphoneVerifyOne`, user.cellphoneVerifyOne);
	router.post(`${prefix}users/cellphoneVerifyTwo`, user.cellphoneVerifyTwo);
	router.resources(`${prefix}users`, user);

	const site = controller.site;
	router.post(`${prefix}sites/:id/groups`, site.postGroups);
	router.put(`${prefix}sites/:id/groups`, site.putGroups);
	router.delete(`${prefix}sites/:id/groups`, site.deleteGroups);
	router.get(`${prefix}sites/:id/groups`, site.getGroups);
	router.resources(`${prefix}sites`, site);

	//const page = controller.page;
	//router.get(`${prefix}pages/search`, page.search);
	//router.get(`${prefix}pages/visit`, page.visit);
	//router.resources(`${prefix}pages`, page);

	const group = controller.group;
	router.post(`${prefix}groups/:id/members`, group.postMembers);
	router.delete(`${prefix}groups/:id/members`, group.deleteMembers);
	router.get(`${prefix}groups/:id/members`, group.getMembers);
	router.resources(`${prefix}groups`, group);

	const groupMember = controller.groupMember;
	router.resources(`${prefix}groupMembers`, groupMember);

	const siteGroup = controller.siteGroup;
	router.resources(`${prefix}siteGroups`, siteGroup);

	//const domain = controller.domain;
	//router.resources(`${prefix}domains`, domain);

	//const file = controller.file;
	//router.post(`${prefix}files/upsert`, file.upsert);
	//router.get(`${prefix}files/:id/token`, file.token);
	//router.resources(`${prefix}files`, file);

	//const favorite = controller.favorite;
	//router.get(`${prefix}favorites/exist`, favorite.exist);
	//router.resources(`${prefix}favorites`, favorite);

}
