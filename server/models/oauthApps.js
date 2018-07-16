
import Model from "./model.js";
import uuidv1 from "uuid/v1";

const getUuid = () => uuidv1().replace(/-/g, "");

export const OauthApps = class extends Model {
	constructor() {
		super();
	}

	async create(data) {
		data.clientId = getUuid();
		data.clientSecret = getUuid();

		const data = await this.model.create(data);

		return data;
	}
	
	async update(data) {
		if (!data.id) return;

		delete data.clientId;
		delete data.clientSecret;

		const data = await this.model.update(data, {where: {id: data.id}});

		return data;
	}
}

export default new OauthApps();
