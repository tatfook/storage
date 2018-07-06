import Model from "./model.js";

import {
	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} from "@@/common/consts.js";

export const SiteGroups = class extends Model {
	constructor() {
		super();
	}
}

export default new SiteGroups();
