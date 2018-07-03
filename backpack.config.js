const path = require("path");

module.exports = {
	webpack: (config, options, webpack) => {
		config.entry.main = './server/index.js'
		config.resolve.alias = {
			"@@": path.resolve(__dirname),
			"@": path.resolve(__dirname, "server"),
		}
		return config
	}
}
