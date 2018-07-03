import Model from "./model.js";
import {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Favorites = class extends Model {
	constructor() {
		super();
	}

	// 获取粉丝
	async getFollows(userId) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.userId = users.id and type = :type and favorites.favoriteId = :favoriteId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_USER,
				favoriteId: userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	// 关注
	async getFollowing(userId) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.favoriteId = users.id and type = :type and favorites.userId = :userId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_USER,
				userId: userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	// 获取收藏的站点
	async getFavoriteSites(userId) {
		const sql = `select sites.*
			from favorites, sites 
			where favorites.favoriteId = sites.id and type = :type and favorites.userId = :userId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_SITE,
				userId: userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	// 获取收藏的页面
	async getFavoritePages(userId) {
		const sql = `select pages.*
			from favorites, pages 
			where favorites.favoriteId = pages.id and type = :type and favorites.userId = :userId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_PAGE,
				userId: userId,
			}
		});

		return ERR.ERR_OK(result);
	}

	async getStatistics(userId) {
		// 粉丝
		const followsCount = await this.model.count({where:{
			favoriteId:userId,
			type:ENTITY_TYPE_USER,
		}});

		// 关注
		const followingCount = await this.model.count({where:{
			userId,
			type:ENTITY_TYPE_USER,
		}});

		// 站点
		const siteFavoriteCount = await this.model.count({where:{
			userId,
			type:ENTITY_TYPE_SITE,
		}});
		
		// 页面
		const pageFavoriteCount = await this.model.count({where:{
			userId,
			type:ENTITY_TYPE_PAGE,
		}});

		// 返回统计信息
		return {
			followsCount,
			followingCount,
			siteFavoriteCount,
			pageFavoriteCount,
		}
	}
}

export default new Favorites();
