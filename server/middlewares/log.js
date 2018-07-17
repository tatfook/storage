import _ from "lodash";
import uuidv1 from "uuid/v1";

import {logs} from "@/models/models.js";
import {LOG_TYPE_REQUEST_ELAPSED} from "@@/common/consts.js";

export const TRACE = 0;
export const DEBUG = 1;
export const INFO = 2;
export const WARN = 3;
export const ERROR = 4;
export const FATAL = 5;

const LOG_LEVEL = {
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
}

export const Log = class {
	constructor(module, level, logId, url) {
		this.module = module;
		this.level = level || DEBUG;
		this.logId = logId;
		this.url = url;
	}

	async log(level, message, type) {
		if (typeof(message) == "object") message = JSON.stringify(message);

		const msg = {
			level: level,
			logId: this.logId,
			module: this.module,
			url: this.url,
			message,
			type,
		}

		await logs.upsert(msg);
	}

	async trace(message, type) {
		await this.log(TRACE, message, type);
	}

	async debug(message, type) {
		await this.log(DEBUG, message, type)
	}

	async info(message, type) {
		await this.log(DEBUG, message, type)
	}

	async warn(message, type) {
		await this.log(DEBUG, message, type)
	}

	async fatal(message, type) {
		await this.log(DEBUG, message, type)
	}
}

export default (options = {}) => {
	const module = options.module;
	const level = typeof(options.level) == "string" ? LOG_LEVEL[options.level.toUpperCase()] : options.level;

	return async (ctx, next) => {
		const requestId = ctx.headers["requestid"] || uuidv1();
		const url = ctx.href.substring(0, ctx.href.indexOf("?") < 0 ? ctx.href.length : ctx.href.indexOf("?"));
		const log = new Log(module, level, requestId, url);
		const stateTime = _.now();

		ctx.state.log = log;

		await next();

		const endTime = _.now();
		const time = endTime - stateTime;
		await log.debug(`请求耗时${time}ms`, LOG_TYPE_REQUEST_ELAPSED);
	}
}

