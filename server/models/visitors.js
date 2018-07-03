import Model from "./model.js";
import {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} from "@@/common/consts.js";
import ERR from "@@/common/error.js";

export const Visitors = class extends Model {
	constructor() {
		super();
	}

	updateVisitors(visitors, visitorId) {
		if (!visitorId) return visitors;

		visitors = JSON.parse(visitors || "[]");
		for (let i = 0; i < (visitors || []).length; i++) {
			let visitor = visitors[i];
			if (visitor == visitorId) {
				let tmp = visitors[0];
				visitors[0] = visitor;
				visitors[i] = tmp;

				return JSON.stringify(visitors);
			}
		}

		visitors.push(visitorId);
		if (visitors.length > 1000) 
			visitors.splice(visitors.length-1, 1);

		return JSON.stringify(visitors);
	}

	async addPageVisitorCount(entityId, userId, visitorId) {
		let data = await this.model.findOne({
			where: {
				entityId,
				type: ENTITY_TYPE_PAGE,
			}
		});

		if (!data) {
			data = {
				userId,
				entityId,
				type: ENTITY_TYPE_PAGE,
				count: 0,
			}
		} else {
			data = data.get({plain:true});
		}


		data.userId = userId || data.userId;
		data.count = data.count + 1;
		data.visitors = this.updateVisitors(data.visitors, visitorId);

		await this.model.upsert(data);

		return data;
	}
}

export default new Visitors();

