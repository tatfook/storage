
module.exports = (options, app) => {
	const config = app.config.self;
	return async function(ctx, next) {
		await next();
	}
}
