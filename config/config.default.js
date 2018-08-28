
exports.keys = "keepwork";

exports.cors = {
	origin: "*",
}

exports.middleware = ['authenticated'];

exports.security = {
	xframe: {
		enable: false,
	},
	csrf: {
		enable: false,
	},
}
