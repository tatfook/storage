
const Transport = require("egg-logger").Transport;

class DBTransport extends Transport {
	log(level, args, meta) {
		const msg = super.log(level, args, meta);
		console.log("DB:" + msg);
	}
}


module.exports = app => {
	app.logger.set("DB", new DBTransport)
}
