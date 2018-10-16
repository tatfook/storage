
const _ = require("lodash");
const axios = require("axios");
const pathToRegexp = require('path-to-regexp');

class Api  {
	constructor(config, app) {
		this.config = config;
		this.app = app;
	}
	
	curlConfig(token, baseURL) {
		return {
			headers: {
				"Authorization":"Bearer " + token,
			},
			baseURL: baseURL,
		}
	}

	async curl(method, url, data, config = {}) {
		url = config.baseURL + pathToRegexp.compile(url)(data || {});
		method = (method || "get").toLowerCase();
		config = {...config, method, url};
		if (method == "get" || method == "delete" || method == "head" || method == "options") {
			config.params = data;
		} else {
			config.data = data;
		}

		return axios.request(config)
			.then(res => res.data)
			.catch(res => {
				console.log(res);
			});

	}

	get gitConfig() {
		return this.curlConfig(this.config.gitGatewayToken, this.config.gitGatewayURL);
	}

	get esConfig() {
		return this.curlConfig(this.config.gitGatewayToken, this.config.esBaseURL);
	}

	async createGitUser(data) {
		return await this.curl("post", "/accounts", data, this.gitConfig);
	}

	async createGitProject(data) {
		return await this.curl("post", "/projects/user/:username", data, this.gitConfig);
	}
	
	async deleteGitProject(data) {
		const url = "/projects/" + encodeURIComponent(data.username + "/" + data.sitename);
		return await this.curl('delete', url, {}, this.gitConfig);
	}

	async setGitProjectVisibility(data) {
		const url = "/projects/" + encodeURIComponent(data.username + "/" + data.sitename) + "/visibility";

		return await this.curl('put', url, data, this.gitConfig);
	}


	async usersUpsert(inst) {
		return this.curl('post', `/users/${inst.id}/upsert`, {
		//return await this.curl('post', `/users/${inst.id}/upsert`, {
			id: inst.id,
			username: inst.username,
			user_portrait: inst.portrait,
		}, this.esConfig);
	}

	async sitesUpsert(inst) {
		return this.curl('post', `/sites/${inst.id}/upsert`, {
		//return await this.curl('post', `/sites/${inst.id}/upsert`, {
			id: inst.id,
			username: inst.username,
			sitename: inst.sitename,
			display_name: inst.displayName,
			cover: inst.extra.imageUrl,
			desc: inst.description,
		}, this.esConfig);
	}

	async projectsUpsert(inst) {
		const tags = (inst.tags || "").split("|").filter(o => o);
		const user = await this.app.model.users.findOne({where:{id:inst.userId}});
		if (!user) return;

		return this.curl('post', `/projects/${inst.id}/upsert`, {
		//return await this.curl('post', `/projects/${inst.id}/upsert`, {
			id: inst.id,
			name: inst.name,
			username: user.username,
			user_portrait: user.portrait,
			visibility: inst.visibility == 0 ? "public" : "private",
			recruiting: (inst.privilege & 1) ? true : false,
			type: inst.type == 0 ? "paracraft" : "site",
			created_time: inst.createdAt,
			cover: inst.extra.imageUrl,
			total_like: inst.star,
			total_view: inst.visit,
			total_mark: inst.favorite,
			recent_like: inst.lastStar,
			recent_view: inst.lastVisit,
		}, this.esConfig);
	}

	async packagesUpsert(inst) {

	}

	async usersDestroy({id}) {
		return await this.curl('delete', `/users/${id}`, {}, this.esConfig);
	}

	async sitesDestroy({id}) {
		return await this.curl('delete', `/sites/${id}`, {}, this.esConfig);
	}

	async projectsDestroy({id}) {
		return await this.curl('delete', `/projects/${id}`, {}, this.esConfig);
	}

	async packagesDestroy({id}) {
		return await this.curl('delete', `/packages/${id}`, {}, this.esConfig);
	}
}

module.exports = app => {
	const config = app.config.self;

	config.gitGatewayToken = app.util.jwt_encode({userId:1, roleId:10}, config.secret, 3600 * 24 * 365 * 10);
	app.api = new Api(config, app);
}

