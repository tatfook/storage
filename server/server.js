import Koa from "koa";
import cors from "@koa/cors";
import jwt from "koa-jwt";
import Router from "koa-router";
import KoaBody from "koa-body";
import Static from "koa-static";
import wurl from "wurl";
import _ from "lodash";
import axios from "axios";

import registerControllerRouter from "./controllers/index.js";


//import log from "./log.js";
import config from "./config.js";
import models from "./models/index.js";
import util from "../common/util.js";

const apiRouter = new Router({
	prefix: config.apiBaseUrl,
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
}

