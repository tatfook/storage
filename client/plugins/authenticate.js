import vue from "vue";
import vueAxios from "vue-axios";
import vueAuthenticate from "vue-authenticate";
import axios from "axios";

import config from "@/config.js";

const baseUrl = config.origin + config.baseUrl + "oauthUsers/";
console.log(baseUrl);

vue.use(vueAxios, axios);
vue.use(vueAuthenticate, {
	providers: {
		xinlang: {
			name:"xinlang",
			authorizationEndpoint: "https://api.weibo.com/oauth2/authorize",
			clientId: config.oauths.xinlang.clientId,
			redirectUri: baseUrl + "xinlang",
			url: baseUrl + "token",
			oauthType: '2.0',
			popupOptions: { width: 1020, height: 618  },
		},

		weixin: {
			name:"weixin",
			oauthType: '2.0',
			authorizationEndpoint: "https://open.weixin.qq.com/connect/qrconnect",
			clientId: config.oauths.weixin.clientId,
			appid: config.oauths.weixin.appid || config.oauths.weixin.clientId,
			redirectUri: baseUrl + "weixin",
			url: baseUrl + "token",
			popupOptions: { width: 1020, height: 618  },
			scope:'snsapi_login',
			requiredUrlParams: ['scope', "appid", "state"],
			state: "weixin",
		},

		qq: {
			name:"qq",
			oauthType: '2.0',
			authorizationEndpoint: "https://graph.qq.com/oauth2.0/authorize",
			scope: "get_user_info",
			clientId: config.oauths.qq.clientId,
			redirectUri: baseUrl + "qq",
			url: baseUrl + "token",
			popupOptions: { width: 1020, height: 618  },
		},

		github: {
			name:"github",
			authorizationEndpoint: "https://github.com/login/oauth/authorize",
			scope: ['user:email'],
			scopeDelimiter: ' ',
			clientId: config.oauths.github.clientId,
			redirectUri: baseUrl + "github",
			url: baseUrl + "token",
		},

		facebook: {
			clientId: config.oauths.facebook.clientId,
			clientSecret: config.oauths.facebook.clientSecret,
			redirectUri: config.oauths.facebook.redirectUri,
			authorizationEndpoint: config.oauths.facebook.authorizationEndpoint,
		},
	}
});
