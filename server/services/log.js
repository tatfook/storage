import _ from "lodash";
import {logs} from "@/models/models.js";

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
		const self = this;
		this.module = module;
		this.logId = logId;
		this.url = url;

		this.setLevel(level || DEBUG);

		_.each(LOG_LEVEL, (level, key) => {
			self[_.lowerCase(key)] = async (message, data, type) => await self.log(level, message, data, type); 
		});
	}

	async log(level, message, data, type) {
		if (level < this.level) return;
		
		if (level <= DEBUG) {
			console.log(message, data);
		}

		if (typeof(message) == "object") message = JSON.stringify(message);

		const msg = {
			level: level,
			logId: this.logId,
			module: this.module,
			url: this.url,
			message: message,
			type: type || LOG_TYPE_DEFAULT,
			data: data,
		}

		await logs.upsert(msg);
	}

	setLevel(level) {
		if (typeof(level) == "string") {
			level = _.upperCase(level);
			level = LOG_LEVEL[level] || this.level;
		}

		this.level = level;
	}

	//async trace(message, type, data) {
		//await this.log(TRACE, message, type, data);
	//}

	//async debug(message, type, data) {
		//await this.log(DEBUG, message, type, data)
	//}

	//async info(message, type) {
		//await this.log(INFO, message, type)
	//}

	//async warn(message, type) {
		//await this.log(WARN, message, type)
	//}

	//async error(message, type) {
		//await this.log(ERROR, message, type)
	//}

	//async fatal(message, type) {
		//await this.log(FATAL, message, type)
	//}
}

export default Log;
