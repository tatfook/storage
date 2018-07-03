import Model from "./model.js";

import consts from "@@/common/consts.js";

const USER_ACCESS_LEVEL_NONE = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_NONE;
const USER_ACCESS_LEVEL_READ = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_READ;
const USER_ACCESS_LEVEL_WRITE = consts.USER_ACCESS_LEVEL.USER_ACCESS_LEVEL_WRITE;



export const GroupMembers = class extends Model {
	constructor() {
		super();
	}
}

export default new GroupMembers();
