
const _ = require("lodash");
const axios = require("axios");
const pathToRegexp = require('path-to-regexp');

class Api  {
	constructor(config) {
		this.config = config;
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
		config = {...this.config, ...config, method, url};
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
		return this.curlConfig(this.config.esGatewayToken, this.config.esGatewayURL);
	}

	async createGitUser(data) {
		return await this.curl("post",  + "/accounts", data, this.gitConfig);
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

	async setESUserInfo(data) {
		if (data.nickname) data.displayName = data.nickname;

		const url = "/users/:username";
		return await this.curl("put", url, data, this.esConfig);
	}

	async setESSiteInfo(data) {
		if (data.description) data.desc = data.description;
		if (data.extra && data.extra.logoUrl) data.logoUrl = data.extra.logoUrl;
		if (data.extra && data.extra.displayName) data.displayName = data.extra.displayName;

		const url = "/sites/" + encodeURIComponent(data.username + "/" + data.sitename);
		return await this.curl("put", url, data, this.esConfig);
	}
}

module.exports = app => {
	const config = app.config.self;

	config.gitGatewayToken = app.util.jwt_encode({userId:1, roleId:10}, config.secret, 3600 * 24 * 365 * 10);
	config.esGatewayToken = config.gitGatewayToken;
	app.api = new Api(config);
}

