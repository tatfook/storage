import _ from "lodash";
import Router from "koa-router";

import config from "@/config.js";
import {validate} from "@/middlewares/index.js";
import {ERR_UNATUH, ERR_OK, ERR_PARAMS} from "@/common/error.js";

import files from "@/controllers/files.js";
import siteFiles from "@/controllers/siteFiles.js";

const controllers = {
	files,
	siteFiles,
}

const router = new Router({
	prefix: config.apiUrlPrefix,
});

const getParams = (ctx) => {
	const method = ctx.request.method.toLowerCase();
	let params = null;

	if (method == "get" || method == "delete" || method == "head" || method == "options") {
		params = ctx.request.query;
	} else {
		params = ctx.request.body;
	}

	params = ctx.state.params || params || {};

	return params;
	//return _.merge(params, ctx.params);
}

_.each(controllers, Ctrl => {
	_.each(Ctrl.getRoutes(), (route) => {
		const methods = _.isArray(route.method) ? route.method : [route.method || "get"];
		_.each(methods, method => {
			method = _.lowerCase(method);
			
			const path = (Ctrl.pathPrefix || "") + "/" + (route.path || "");
			
			//console.log(path, method);
			router[method](path, validate(route.validate), async (ctx, next) => {
				// 认证中间件
				if (route.authentated && !ctx.state.user) {
					ctx.body = ERR_UNATUH();
					return;
				}

				ctx.state.user = ctx.state.user || {};
				ctx.state.params = getParams(ctx);
				try {
					const ctrl = new Ctrl();
					const body = await ctrl[route.action](ctx);	
					ctx.body = body || ctx.body;
				} catch(e) {
					console.log(e);
					ctx.status = 500;
					ctx.body = "请求无法处理";
				}
				//console.log(ctx.body);
			});
		})
		
	})
});

router.all("/*", (ctx, next) => {
	ctx.status = 404;
});

export default router;


