
import util from "@@/common/util.js";
import config from "@@/common/config.js";

function getCookieToken(ctx) {
	return ctx.cookies.get("token");
}

function getAuthorizationHeaderToken(ctx) {
	const parts = ctx.header.authorization.split(' ');

	if (parts.length == 2) {
		if (/^Bearer$/i.test(parts[0])) return parts[1];
	}

	return;
}


export const authenticated = (ctx, next) {
	const token = getCookieToken() || getAuthorizationHeaderToken();
	ctx.state.user = token ? util.jwt_decode(token, config.secret, true) : undefined;

	next();
}

export default authenticated;
