import Model from "./model.js";
import _ from "lodash";

import {
	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Sites = class extends Model {
	constructor() {
		super();
	}

	async isEditableByMemberId(siteId, memberId) {
		let result = null;

		result = await this.getMemberLevel(siteId, memberId);

		if (result.isErr()) return false;

		const level = result.getData();

		if (level >= USER_ACCESS_LEVEL_WRITE) return true;

		return false;
	}

	async getByName(username, sitename) {
		const sql = `select sites.*, users.username
			from users, sites
			where users.id = sites.userId 
			and users.username = :username and sites.sitename = :sitename`;

		const result = await this.query(sql, {
			replacements: {
				username,
				sitename,
			},
		});

		if (result.length == 1) {
			return ERR.ERR_OK(result[0]);
		}

		return ERR.ERR_NOT_FOUND();
	}

	async getMemberLevel(siteId, memberId) {
		let site = await this.model.findOne({where:{id:siteId}});
		if (!site) return ERR.ERR_PARAMS();

		site = site.get({plain: true});

		if (siteId.userId == memberId) return ERR.ERR_OK(USER_ACCESS_LEVEL_WRITE);

		let level = USER_ACCESS_LEVEL_READ;
		if (site.visibility == ENTITY_VISIBILITY_PRIVATE) level = USER_ACCESS_LEVEL_NONE;

		let sql = `select level 
			from siteMembers
			where siteId = :siteId and memberId = :memberId`;
		let result = await this.query(sql, {
			replacements: {
				siteId,
				memberId,
			}
		});
		
		_.each(result, val => level = level < val.level ? val.level : level);

		sql = `select siteGroups.level 
			from sites, siteGroups, groupMembers 
			where sites.id = siteGroups.siteId and siteGroups.groupId = groupMembers.groupId 
			and sites.id = :siteId and groupMembers.memberId = :memberId`;

		result = await this.query(sql, {
			replacements: {
				siteId: siteId,
				memberId: memberId,
			}
		});

		_.each(result, val => level = level < val.level ? val.level : level);

		return ERR.ERR_OK(level);
	}
}

export default new Sites();
