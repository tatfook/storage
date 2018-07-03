import joi from "joi";

import Controller from "@/controllers/controller.js";
import {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Favorites = class extends Controller {
	constructor() {
		super();
	}

	// 粉丝
	async getFollows(ctx) {
		const params = ctx.state.params;

		return await this.model.getFollows(params.userId);
	}

	// 关注
	async getFollowing(ctx) {
		return await this.model.getFollowing(ctx.state.params.userId);
	}

	async getFavoriteSites(ctx) {
		return await this.model.getFavoriteSites(ctx.state.params.userId);
	}

	async getFavoritePages(ctx) {
		return await this.model.getFavoritePages(ctx.state.params.userId);
	}

	// 是否关注
	async isFollowing(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_USER;

		const result = await this.model.findOne({where:params});

		return ERR.ERR_OK(result ? true : false);
	}

	// 取消关注
	async unFollowing(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_USER;

		const result = await this.model.destroy({where:params});

		return ERR.ERR_OK(result);
	}

	// 关注
	async following(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_USER;

		console.log(params, ctx.state.user);

		const result = await this.model.create(params);

		return ERR.ERR_OK(result);
	}

	async favoriteSite(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_SITE;

		const result = await this.model.create(params);

		return ERR.ERR_OK(result);
	}

	async unFavoriteSite(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_SITE;

		const result = await this.model.destroy({where:params});

		return ERR.ERR_OK(result);
	}

	async favoritePage(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_PAGE;

		const result = await this.model.create(params);

		return ERR.ERR_OK(result);
	}

	async unFavoritePage(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;

		params.userId = userId;
		params.type = ENTITY_TYPE_PAGE;

		const result = await this.model.destroy({where:params});

		return ERR.ERR_OK(result);
	}

	static getRoutes() {
		this.pathPrefix = "favorites";
		const baseRoutes = super.getRoutes();

		const routes = [
		{
			path:"isFollowing",
			method: "GET",
			action: "isFollowing",
			authenticated: true,
			validate: {
				query: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"following",
			method: "POST",
			action: "following",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"favoriteSite",
			method: "POST",
			action: "favoriteSite",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"favoritePage",
			method: "POST",
			action: "favoritePage",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"unFollowing",
			method: "POST",
			action: "unFollowing",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"unFavoriteSite",
			method: "POST",
			action: "unFavoriteSite",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"unFavoritePage",
			method: "POST",
			action: "unFavoritePage",
			authenticated: true,
			validate: {
				body: {
					favoriteId: joi.number().required(),
				}
			}
		},
		{
			path:"getFollows",
			method: "GET",
			action: "getFollows",
			validate: {
				query: {
					userId: joi.number().required(),
				}
			}
		},
		{
			path:"getFollowing",
			method: "GET",
			action: "getFollowing",
			validate: {
				query: {
					userId: joi.number().required(),
				}
			}
		},
		{
			path:"getFavoriteSites",
			method: "GET",
			action: "getFavoriteSites",
			validate: {
				query: {
					userId: joi.number().required(),
				}
			}
		},
		{
			path:"getFavoritePages",
			method: "GET",
			action: "getFavoritePages",
			validate: {
				query: {
					userId: joi.number().required(),
				}
			}
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default Favorites;
