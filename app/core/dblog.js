
const Transport = require("egg-logger").Transport;

class RemoteErrorTransport extends Transport {
	log(level, args, meta) {
		const msg = super.log(level, args, meta);
		console.log("DB:" + msg);
	}
}

