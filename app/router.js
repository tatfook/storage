
module.exports = app => {
	const {router, config,  controller} = app;
	const selfConfig = config.self;

	const prefix = selfConfig.apiUrlPrefix;

	const index = controller.index;
	router.resources(`${prefix}indexs`, index);

	const user = controller.user;
	router.get(`${prefix}users/:id/detail`, user.detail);
	router.post(`${prefix}users/register`, user.register);
	router.post(`${prefix}users/login`, user.login);
	router.post(`${prefix}users/logout`, user.logout);
	router.get(`${prefix}users/profile`, user.profile);
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

	const siteGroup = controller.siteGroup;
	router.resources(`${prefix}site_groups`, siteGroup);

	const domain = controller.domain;
	router.get(`${prefix}domains/exist`, domain.exist);
	router.resources(`${prefix}domains`, domain);

	const favorite = controller.favorite;
	router.delete(`${prefix}favorites`, favorite.destroy);
	router.get(`${prefix}favorites/follows`, favorite.follows);
	router.get(`${prefix}favorites/exist`, favorite.exist);
	router.resources(`${prefix}favorites`, favorite);

	const oauthUser = controller.oauthUser;
	router.post(`${prefix}oauth_users/qq`, oauthUser.qq);
	router.post(`${prefix}oauth_users/weixin`, oauthUser.weixin);
	router.post(`${prefix}oauth_users/github`, oauthUser.github);
	router.post(`${prefix}oauth_users/xinlang`, oauthUser.xinlang);
	router.resources(`${prefix}oauth_users`, oauthUser);

	const comment = controller.comment;
	router.resources(`${prefix}comments`, comment);

	const file = controller.file;
	router.get(`${prefix}files/:id/rawurl`, file.rawurl);
	router.get(`${prefix}files/:id/token`, file.token);
	router.get(`${prefix}files/statistics`, file.statistics);
	router.get(`${prefix}files/list`, file.list);
	router.post(`${prefix}files/list`, file.list);
	router.post(`${prefix}files/qiniu`, file.qiniu);
	router.get(`${prefix}files/imageAudit`, file.imageAudit);
	router.get(`${prefix}files/videoAudit`, file.videoAudit);
	router.post(`${prefix}files/audit`, file.audit);
	router.resources(`${prefix}files`, file);

	const siteFile = controller.siteFile;
	router.post(`${prefix}siteFiles/url`, siteFile.url);
	router.get(`${prefix}siteFiles/:id/rawurl`, siteFile.rawurl);
	router.get(`${prefix}siteFiles/:id/raw`, siteFile.raw);
	router.resources(`${prefix}siteFiles`, siteFile);

	const tag = controller.tag;
	router.resources(`${prefix}tags`, tag);

	const project = controller.project;
	router.post(`${prefix}projects/search`, project.search);
	router.get(`${prefix}projects/:id/visit`, project.visit);
	router.post(`${prefix}projects/:id/star`, project.star);
	router.post(`${prefix}projects/:id/unstar`, project.unstar);
	router.resources(`${prefix}projects`, project);

	const issue = controller.issue;
	router.resources(`${prefix}issues`, issue);

	const member = controller.member;
	router.resources(`${prefix}members`, member);

	const apply = controller.apply;
	router.resources(`${prefix}applies`, apply);

	const convert = controller.convert;
	router.get(`${prefix}converts`, convert.convert);
	router.get(`${prefix}converts/users`, convert.users);
	router.get(`${prefix}converts/sites`, convert.sites);
	router.get(`${prefix}converts/groups`, convert.groups);
	router.get(`${prefix}converts/group_members`, convert.groupMembers);
	router.get(`${prefix}converts/site_groups`, convert.siteGroups);

	const admin = controller.admin;
	router.resources(`${prefix}admins/:resources`, admin);

	const trade = controller.trade;
	router.post(`${prefix}trades/pingpp`, trade.pingpp);
	router.resources(`${prefix}trades`, trade);

	const world = controller.world;
	router.resources(`${prefix}worlds`, world);
}
