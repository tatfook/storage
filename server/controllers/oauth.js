import axios from "axios";
import wurl from "wurl";
import config from "../config.js";
import ERR from "../../common/error.js";


export const Oauth = function() {

}

Oauth.prototype.github = async function(ctx) {
	const githubAccessTokenUrl = 'https://github.com/login/oauth/access_token';
	const githubUserInfoUrl = 'https://api.github.com/user';
	const params = ctx.state.params;
	params.client_id = params.client_id || config.oauth.github.clientId;
	params.client_secret = params.client_secret || config.oauth.github.clientSecret;
	params.redirect_uri = params.redirect_uri || config.oauth.github.redirectUri;
	
	const queryStr = await axios.get(githubAccessTokenUrl, {params}).then(res => res.data);
	if (queryStr.indexOf("error=") == 0){
		return ERR.ERR();
	}
	const data = wurl("?", "http://localhost/index?" + queryStr);
	const access_token = data.access_token;
	console.log(queryStr);
	console.log(data);

	const userinfo = await axios.get(githubUserInfoUrl + "?access_token=" + access_token).then(res => res.data);
	console.log(userinfo);
}


Oauth.prototype.facebook = async function(ctx) {
	const facebookAccessTokenUrl = 'https://graph.facebook.com/v3.0/oauth/access_token';
	const facebookUserInfoUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
	const params = ctx.state.params;
	params.grant_type = "authorization_code";
	params.client_id = params.client_id || config.oauth.facebook.clientId;
	params.client_secret = params.client_secret || config.oauth.facebook.clientSecret;
	params.redirect_uri = params.redirect_uri || config.oauth.facebook.redirectUri;
	
	console.log(ctx.request.method);
	console.log(params);

	const data = await axios.get(facebookAccessTokenUrl, {params}).then(res => res.data);
	console.log(data);
	//const access_token = data.access_token;
	//console.log(queryStr);
	//console.log(data);

	//const userinfo = await axios.get(githubUserInfoUrl + "?access_token=" + access_token).then(res => res.data);
	//console.log(userinfo);
}

Oauth.getRoutes = function() {
	const self = this;
	self.pathPrefix = "oauth";
	const routes = [
	{
		path: "github",
		method: "get",
		action: "github",
	},
	{
		path: "github",
		method: "all",
		action: "github",
	},
	];

	return routes;
}

export default Oauth;
