import vue from "vue";
import _ from "lodash";
import jwt from "jwt-simple";
import config from "@/config.js";
import consts from "@/lib/consts.js";
import storage from "@/lib/storage.js";
import indexedDB from "@/lib/indexedDB.js";
import events from "@/lib/events.js";

const app = {
	isSmallScreen: window.innerWidth < 768,
	object:{},
	events,
	vue: new vue(),
	config: config,
	consts: consts,
	storage: storage,
	indexedDB: indexedDB,
	pageDB: null,
}

indexedDB.open().then(function(){
	app.pageDB = indexedDB.getStore("sitepage");
});

app.getRouteName = (name) => config.urlPrefix + "-" + name;

window.addEventListener("message", function(e) {
	const FAIL = {cmd: "fail"};
	const SUCCESS = {cmd: "success"};

	function postMessage(data, origin) {
		origin = origin || "*";
		data = data || SUCCESS;
		e.source.postMessage(data, origin);
	}

	const data = e.data || {}

	if (data.cmd == "element_style") {
		const selector = data.selector;
		const style = data.style || {};
		const el = document.getElementById(selector);

		if (!el) {
			return postMessage(FAIL);
		}

		console.log(el, style);
		el.style.height = style.height;
		el.style.width = style.width;
	} else {
		//console.log("cmd not found", e);
		return;
	}

	postMessage(SUCCESS)
});

window._ = _;
window.g_app = app;
