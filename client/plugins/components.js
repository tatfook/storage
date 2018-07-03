import vue from "vue";
import _ from "lodash";
import jwt from "jwt-simple";

import EVENTS from "@/lib/events.js";
import config from "@/config.js";
import api from "@@/common/api/note.js";

import "@/components/bases";
import "@/components/complex";
import {registerModTag} from  "@/components/mods";

//console.log(process.client);
let Cookies;

if (process.client) {
	Cookies = require("js-cookie");
}

function localStorageSetUser(user = {}) {
	if (process.server) {
		return ;
	}

	window.localStorage.setItem("userinfo", JSON.stringify(user));
}

function localStorageGetUser() {
	if (process.server) {
		return {};
	}

	try {
		return JSON.parse(window.localStorage.getItem("userinfo"));
	} catch (e) {
		return {};
	}
}

// 定义事件对象
const events = new vue();
export const user = {
	id: null,
	username: null,
	token: null,

	...localStorageGetUser(),
};

export const login = (x) => {
	_.each(x, (val, key) => vue.set(user, key, val));

	if (!isAuthenticated()){
		return logout();
	}

	if (process.client) {
		localStorageSetUser(user);
		Cookies.set("token", user.token);
	}

	api.options.baseURL = config.baseURL;
	api.options.headers['Authorization'] = "Bearer " + user.token;

}

export const logout = () => {
	_.each(user, (val, key) => vue.delete(user, key));

	if (process.client) {
		localStorageSetUser({});
		Cookies.remove("token");
		api.options.headers['Authorization'] = undefined;
	}
}

export const setUser = (usr) => {
	_.merge(user, usr);
	if (process.client) localStorageSetUser(user);
}

export const isAuthenticated = () => {
	if (!user.token) return false;
	const payload = jwt.decode(user.token, null, true);

	if (payload.nbf && Date.now() < payload.nbf*1000) {
		return false;
	}
	if (payload.exp && Date.now() > payload.exp*1000) {
		return false;
	}

	return true;
}

// API config初始化
api.options.baseURL = config.origin + config.baseUrl;
if (isAuthenticated()) {
	api.options.headers['Authorization'] = "Bearer " + user.token;
} else {
	logout();
}

export const component = {
	data: function() {
		return {
			EVENTS:EVENTS,
			user: user, // 共享用户信息
			api: api,
		}
	},

	props: {
		namespace: {
			type: String,
		},
	},

	methods: {
		on(eventName, callback) {
			events.$on(eventName, callback);
		},
		emit(eventName, ...args) {
			events.$emit(eventName, ...args);
		},
		login(userinfo) {
			login(userinfo);
		},
		logout() {
			logout();
		},
		setUser(usr) {
			setUser(usr);
		},
		isAuthenticated() {
			return isAuthenticated();
		},
		pushName(name) {
			this.$router.push({name:config.urlPrefix + '-' + name});
		},
	},

	beforeMount() {
		const self = this;
	},
}

vue.use({
	install(vue, options) {
		vue.mixin(component);
	}
});

export default ({store}) => {
	if (process.client) {
		registerModTag(store);
	}
}
