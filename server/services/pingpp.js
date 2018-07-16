import crypto from "crypto";
import pingpp from "pingpp";

import config from "@/config.js";

//console.log(config.pingpp.pingppPublicKey);

const Pay = class {
	constructor() {
		this.pingpp = pingpp(config.pingpp.key);
		this.pingpp.setPrivateKey(config.pingpp.privateKey);
	}

	
	verifySignature(rawData = "", signature = "") {
		const verifier = crypto.createVerify('RSA-SHA256').update(rawData, "utf8");
		return verifier.verify(config.pingpp.pingppPublicKey, signature, 'base64');
	}

	async createChrage(data) {
		return await new Promise((resolve, reject) => {
			this.pingpp.charges.create(data, function(err, charge) {
				if (err) return reject(err);

				return resolve(charge);
			});
		});
	}
}


export default new Pay();
