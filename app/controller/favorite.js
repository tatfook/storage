const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

const Favorite = class extends Controller {
	get modelName() {
		return "favorites";
	}
	
	async index() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({type: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE)});

		let list = [];
		if (params.type == "ENTITY_TYPE_USER") {
			list = await model.favorites.getFollowing(userId);
		} else if (params.type == "ENTITY_TYPE_SITE") {
			list = await model.favorites.getFavoriteSites(userId);
		} else if (params.type == "ENTITY_TYPE_PAGE") {
			list = await model.favorites.getFavoritePages(userId);
		}

		return list;
	}

	async create() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			favoriteId: "int", 
			type: Joi.array().items(Joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE)),
		});

		return await model.favorites.favorite(userId, params.favoriteId, params.type);
	}

	async destroy() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			favoriteId: "int", 
			type: Joi.array().items(Joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE)),
		});

		return await model.favorites.unfavorite(userId, params.favoriteId, params.type);
	}

	async exist() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			favoriteId: "int", 
			type: Joi.array().items(Joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE)),
		});
		const data = await model.favorites.findOne({
			userId,
			favoriteId: params.favoriteId,
			type: params.type,
		})

		return data;
	}

	// 粉丝
	async getFollows(ctx) {
		const params = ctx.state.params;

		return await model.favorites.getFollows(params.userId);
	}

	// 关注
	async getFollowing(ctx) {
		return await model.favorites.getFollowing(ctx.state.params.userId);
	}

	async getFavoriteSites(ctx) {
		return await model.favorites.getFavoriteSites(ctx.state.params.userId);
	}

	async getFavoritePages(ctx) {
		return await model.favorites.getFavoritePages(ctx.state.params.userId);
	}

	// 是否关注
	async isFollowing() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		params.userId = userId;
		params.type = ENTITY_TYPE_USER;

		const result = await model.favorites.findOne({where:params});

		return result ? true : false;
	}

	// 取消关注
	async unfollowing() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.unfollowing(userId, params.favoriteId);

		//notificationsModel.following(params.userId, params.favoriteId, "unfavorite");
		return result;
	}

	// 关注
	async following() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.following(userId, params.favoriteId);

		//notificationsModel.following(params.userId, params.favoriteId, "favorite");
		return result;
	}

	async favoriteSite() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.favoriteSite(userId, params.favoriteId);

		//notificationsModel.favoriteSite(params.userId, params.favoriteId, "favorite");
		return result;
	}

	async unfavoriteSite() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.unfavoriteSite(userId, params.favoriteId);

		//notificationsModel.favoriteSite(params.userId, params.favoriteId, "unfavorite");
		return result;
	}

	async favoritePage() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.favoritePage(userId, params.favoriteId);

		//notificationsModel.favoritePage(params.userId, params.favoriteId, "favorite");
		return result;
	}

	async unFavoritePage() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({favoriteId: "int"});

		const result = await model.favorites.unfavoritePage(userId, params.favoriteId);

		//notificationsModel.favoritePage(params.userId, params.favoriteId, "unfavorite");
		return result;
	}

}

module.exports = Favorite;
