import Model from "./model.js";
import util from "@@/common/util.js";
import ERR from "@@/common/error.js";
import {
	NOTIFICATION_STATE_UNREAD,
	NOTIFICATION_STATE_READ,
} from "@@/common/consts.js";

export const Notifications = class extends Model {
	constructor() {
		super();
	}

	async addNotification(userId, description) {
		const result = await this.model.create({
			userId,
			description,
			state: NOTIFICATION_STATE_UNREAD,
		});

		return ERR.ERR_OK(result);
	}

	async getUnreadByUserId(userId) {
		let result = await this.model.findAndCount({
			where: {
				userId,
				state: NOTIFICATION_STATE_UNREAD,
			}
		});

		return ERR.ERR_OK(result);
	}
	
	async following(userId, followingId, oper="favorite") {
		const models = g_app.models;
		const usersModel = models["users"];

		let user = await usersModel.getByUserId(userId);
		user = user.getData();

		let followingUser = await usersModel.getByUserId(followingId);
		followingUser = followingUser.getData();

		if (oper == "favorite") oper = "关注";
		if (oper == "unfavorite") oper = "取消关注";
		let description = `${user.nickname || user.username} ${oper} ${followingUser.nickname || followingUser.username}`;

		await this.addNotification(userId, description);
		await this.addNotification(followingId, description);
	}

	async favoriteSite(userId, siteId, oper="favorite") {
		const models = g_app.models;
		const usersModel = models["users"];
		const sitesModel = models["sites"];

		let user = await usersModel.getByUserId(userId);
		user = user.getData();

		let site = await sitesModel.getBySiteId(siteId);
		site = site.getData();

		if (oper == "favorite") oper = "收藏";
		if (oper == "unfavorite") oper = "取消收藏";

		let description = `${user.nickname || user.username} ${oper} ${site.sitename}站点`;

		await this.addNotification(userId, description);
		await this.addNotification(site.userId, description);
	}

	async favoritePage(userId, pageId, oper="favorite") {
		const models = g_app.models;
		const usersModel = models["users"];
		const pagesModel = models["pages"];

		let user = await usersModel.getByUserId(userId);
		user = user.getData();

		let page = await pagesModel.getByPageId(pageId);
		page = page.getData();

		let key = util.parseKey(page.key);
		let favoriteUser = usersModel.getByUsername(key.username);
		favoriteUser = favoriteUser.getData();

		if (oper == "favorite") oper = "收藏";
		if (oper == "unfavorite") oper = "取消收藏";

		let description = `${user.nickname || user.username} ${oper} ${key.url}站点`;

		await this.addNotification(userId, description);
		await this.addNotification(favoriteUser.id, description);
	}
}

export default new Notifications();

