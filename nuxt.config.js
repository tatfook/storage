const path = require("path");
const webpack = require("webpack");
const config = require("./server/.config.js");

const rootdir = path.resolve(".");
//console.log(path.resolve(__dirname, "client/pages/note/userpage.vue"));

const pagepath = "client/pages/";
module.exports = {
	render: {
		resourceHints: false,
	},

	srcDir: "client/",

	env: {
		ENV:config.ENV || process.env.NODE_ENV,
	},

	router: {
		extendRoutes(routes) {
			routes.push({
				name: "notfound",
				path:"/note/:path*",
				component: path.resolve(__dirname, pagepath + "note/notfound.vue"),
			});
			routes.push({
				name: "userpage",
				path:"/:username/:sitename/:pagepath+",
				component: path.resolve(__dirname, pagepath + "_user/userpage.vue"),
			});
		},
	},

	plugins: [
	{src:"~/plugins/app", ssr: false},
	{src:"~/plugins/authenticate", ssr: false},
	{src:"~/plugins/persistedstate", ssr: false},
	{src:"~/plugins/codemirror", ssr: false},
	{src:"~/plugins/vueImgInputer", ssr: false},
	{src:"~/plugins/element-ui"},
	//{src:"~/plugins/components", ssr: false},
	{src:"~/plugins/components"},
	//{src:"~/plugins/mxgraph", ssr: false},
	//{src:"~/plugins/test", ssr: false},
	],

	/*
  	** Headers of the page
  	*/
  	head: {
		title: 'starter',
  	  	meta: [
			{ charset: 'utf-8' },
  	  	  	{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
  	  	  	{ hid: 'description', name: 'description', content: 'Nuxt.js project' }
  	  	],
		script: [
			
		],
  	  	link: [
			{ rel: "stylesheet", href: "http://at.alicdn.com/t/font_654450_vfehhtiqe3i.css"},
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  	  	],
  	},
  	/*
  	** Global CSS
  	*/
  	css: [
		'~assets/css/main.css',
		'~assets/css/theme.scss',
		'element-ui/lib/theme-chalk/display.css',
	],
  	/*
  	** Customize the progress-bar color
  	*/
  	loading: { color: '#3B8070' },
  	/*
  	 ** Build configuration
  	 */
  	build: {
		//analyze: true,
		vendor: [
			"lodash",
			"axios",
		],
		babel: {
			//presets:[
			//],
			plugins:[
				"syntax-dynamic-import",
				[
					"component",
					{
						libraryName:"element-ui",
						styleLibraryName:"theme-chalk",
					},
					'transform-async-to-generator',
					'transform-runtime',
				],
			],
		},
  	  	extend (config, ctx) {
			config.resolve.alias["vue$"] = "vue/dist/vue.esm.js";
			config.module.rules.push({
				test: /\.(txt|html|yml)$/,
				use: 'raw-loader',
			});
			if (config.name == "server") {
				return;
			}

			config.entry["vendor1"] = ["~/plugins/codemirror", "qiniu-js"];
			config.entry["vendor2"] = ["~/plugins/element-ui"];
			config.plugins[0] = new webpack.optimize.CommonsChunkPlugin({
				names: ["vendor2" ,"vendor1", "vendor"],
				minChunks: Infinity,
			});

			//config.resolve.alias["gitlabapi$"] = "~/lib/gitlab-api/index.js";
			//console.log(config.resolve.alias);
			config.node = {
				...(config.node || {}),
				fs: "empty",
				tls: "empty",
  	  			net: "empty",
  	  		};
  	  	}
  	}
}
