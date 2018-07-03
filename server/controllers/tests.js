
import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";

import {sendMail} from "@@/common/email.js";
import {sendSms} from "@@/common/sms.js";

export const Tests = class extends Controller {
	constructor() {
		super();
	}

	async test() {
		//const ok = await sendMail("765485868@qq.com", "Message Title", "helle world");

		return await sendSms("18702759796", ["2461", "3分钟"]);
		return ok;
	}

	static getRoutes() {
		this.pathPrefix = "tests";

		const routes = [
		{
			path:"",
			action: "test",
			method: ["GET", "POST"],
		},
		];

		return routes;
	}
}

export default Tests;
