import Koa from "koa";
import cors from "@koa/cors";
import jwt from "koa-jwt";
import Router from "koa-router";
import KoaBody from "koa-body";
import Static from "koa-static";
import wurl from "wurl";
import _ from "lodash";
import axios from "axios";

import Files from "./controllers/files.js";
import registerControllerRouter from "./controllers/index.js";


//import log from "./log.js";
import config from "./config.js";
import models from "./models/index.js";
import api from "../common/api/note.js";
import util from "../common/util.js";

const files = new Files();

api.options.baseURL = config.baseUrl;

const apiRouter = new Router({
	prefix: config.baseUrl,
});

registerControllerRouter(apiRouter);

global.g_app = {
	models,
};

export default (app, views) => {
	app
	.use(cors())
	.use(KoaBody())
	.use(jwt({secret:config.secret, passthrough:true, cookie:"token"}))
	.use(apiRouter.routes())
	.use(apiRouter.allowedMethods());

	app.use(async (ctx, next) => {
		const path = ctx.request.path;
		const method = ctx.request.method;

		if (method.toUpperCase() != "GET") {
			ctx.status = 404;
			ctx.body = "Not Found";
			return;
		}

		const excludeList = [
			"/_",
			"/favicon.ico",
			"/_nuxt/",
			"/static/",
			"/api/",
		];

		if (path.split("/").length < 3 || path.substring(path.lastIndexOf("/")).indexOf(".") < 0) {
			return await next();
		}

		for (let i = 0; i < excludeList.length; i++) {
			if (path.indexOf(excludeList[i]) == 0) {
				return await next();
			}
		}

		const key = util.getKeyByPath(path.substring(1));
		ctx.params = {id: encodeURIComponent(key)};
		files.raw(ctx);
	});
}

