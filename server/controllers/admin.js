import joi from "joi";


export const Admin = class {
	constructor() {

	}

	static getRoutes() {
		this.pathPrefix = "admin/:resources";
		return [

		]
	}
}

export default Admin;
