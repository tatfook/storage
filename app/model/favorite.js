module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	//const {
		//ENTITY_TYPE_USER,
		//ENTITY_TYPE_SITE,
		//ENTITY_TYPE_PAGE,
	//} = app.consts;

	const model = app.model.define("favorites", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		favoriteId: {
			type: BIGINT,
			allowNull: false,
		},

		type: {
			type: INTEGER,
			allowNull: false,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "favoriteId", "type"],
		},
		],
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.domains.findOne({where: where});

		return data && data.get({plain:true});
	}

	// 获取粉丝
	model.getFollows = async function(userId) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.userId = users.id and type = :type and favorites.favoriteId = :favoriteId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_USER,
				favoriteId: userId,
			}
		});

		return result;
	}

	// 关注
	model.getFollowing = async function(userId) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.favoriteId = users.id and type = :type and favorites.userId = :userId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_USER,
				userId: userId,
			}
		});

		return result;
	}

	// 获取收藏的站点
	model.getFavoriteSites = async function(userId) {
		const sql = `select sites.*
			from favorites, sites 
			where favorites.favoriteId = sites.id and type = :type and favorites.userId = :userId`;

		const result = await this.query(sql, {
			replacements: {
				type: ENTITY_TYPE_SITE,
				userId: userId,
			}
		});

		return result;
	}

	// 获取收藏的页面
	model.getFavoritePages = async function(userId) {
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

	model.favorite = async function(userId, favoriteId, type) {
		return await app.model.favorites.create({userId, favoriteId, type});
	}

	model.unfavorite = async function(userId, favoriteId, type) {
		return await app.model.favorites.destroy({where:{userId, favoriteId, type}});
	}

	// 关注
	model.following = async function(userId, favoriteId) {
		return await this.favorite(userId, favoriteId, ENTITY_TYPE_USER);
	}

	// 取消关注
	model.unfollowing = async function(userId, favoriteId) {
		return await this.unfavorite(userId, favoriteId, ENTITY_TYPE_USER);
	}
	
	model.favoriteSite = async function(userId, favoriteId) {
		return await this.favorite(userId, favoriteId, ENTITY_TYPE_SITE);
	}

	model.unfavoriteSite = async function(userId, favoriteId) {
		return await this.unfavorite(userId, favoriteId, ENTITY_TYPE_SITE);
	}

	model.favoritePage = async function(userId, favoriteId) {
		return await this.favorite(userId, favoriteId, ENTITY_TYPE_PAGE);
	}

	model.unfavoritePage = async function(userId, favoriteId) {
		return await this.unfavorite(userId, favoriteId, ENTITY_TYPE_PAGE);
	}

	model.getStatistics = async function(userId) {
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

	return model;
};
