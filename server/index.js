import Koa from 'koa';
import cors from "@koa/cors";
import jwt from "koa-jwt";
import KoaBody from "koa-body";
import wurl from "wurl";
import _ from "lodash";
import Router from "koa-router";
import axios from "axios";

import "@/models";
import router from "@/router.js";
import config from "@/config.js";

console.log(config);

function start () {
	const app = new Koa();
	const host = config.host || '0.0.0.0';
	const port = config.port || 8088;
	const route = new Router();

	route.get("/", (ctx, next) => {
		ctx.body = "hello world";
	});

	app
	.use(cors({origin:"*"}))
	.use(KoaBody())
	.use(jwt({secret:config.secret, passthrough:true, cookie:"token"}))
	.use(route.routes())
	.use(router.routes())
	.use(router.allowedMethods());
	
	app.listen(port, host);
	console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console
}

start();
