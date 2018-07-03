import vue from "vue";
import {Message} from "element-ui";
import consts from "@/lib/consts.js";
import api from "@@/common/api/note.js";

const SET_PAGE_PATH = 'SET_PAGE_PATH';
const SET_PAGE_CONTENT = 'SET_PAGE_CONTENT';
const SET_PAGE = 'SET_PAGE';
const SET_PAGES = 'SET_PAGES';
const SET_SWITCH_PAGE = 'SET_SWITCH_PAGE';
const DELETE_PAGE = 'DELETE_PAGE';


const treeNodeToPage = function(node) {
	let paths = node.key.split("/");
	let page = {
		name:paths[paths.length-1],
		path:node.key,
		type:"blob",
		sha:node.sha,
		hash: node.hash,
		username:paths[0],
	}

	page.name = page.name.replace(/\.md$/, "");
	page.url = page.path.replace(/\.md$/, "");

	return page;
}
//const treeNodeToPage = function(node) {
	//let paths = node.path.split("/");
	//let page = {
		//name:node.name,
		//path:node.path,
		//type:node.type,
		//sha:node.id,
		//username:paths[0],
	//}

	//page.name = page.name.replace(/\.md$/, "");
	//page.url = page.path.replace(/\.md$/, "");

	//return page;
//}

export const state = () => ({
	tagId:null, // 当前tag id
	hoverTagId:null, // 鼠标悬浮tag id
	tagPath:null, // 当前tag path
	hoverTagPath:null, // 鼠标悬浮tag path
	//mode:consts.EDITOR_MODE_EDITOR,
	pagePath:"", //当前页面URL
	pageContent:"", // 当前页面内容
	switchPage:false, // 是否切换页面
	pages:{},       // 页面节点信息
	gits:{},        // 数据源
	sites: {},      // 网站列表
	mode:consts.EDITOR_MODE_NORMAL,
});

export const getters = {
	getTagId: (state) => state.tagId,
	getHoverTagId: (state) => state.hoverTagId,
	getTagPath: (state) => state.tagPath,
	getMode: (state) => state.mode,
	getPagePath: (state) => state.pagePath,
	getPageContent: (state) => state.pageContent,
	switchPage: (state) => state.switchPage,	
	getPages: (state) => state.pages,
	getPageByPath: (state) => (path) => (state.pages[path] || {}),
	getPageContentByPath: (state) => (path) => (state.pages[path] || {}).content,
	//getGit: (state) => (key) => (state.gits[key] || {projectId:4980659, git:gitlab.api, ref:"master", rootPath:"xiaoyao"}),
};

export const actions = {
	indexDB_savePage({commit, getters:{getPageByPath}}, page) {
		let oldpage = getPageByPath(page.path) || {};

		if (page.content != undefined && page.content != oldpage.content) {
			page.isModify = true;
		}
		
		g_app.pageDB.setItem({
			...oldpage,
			...page,
		});

		//console.log(oldpage, page);
		commit(SET_PAGE, page);
	},
	indexDB_deletePage(context, pagePath) {
		g_app.pageDB.deleteItem(pagePath);
	},
	setTagId({commit, state}, tagId) {
		commit("setTagId", tagId);
	},
	setHoverTagId({commit, state}, tagId) {
		commit("setHoverTagId", tagId);
	},
	setTagPath({commit, state}, tagPath) {
		commit("setTagPath", tagPath);
	},
	setMode(context, mode) {
		context.commit("setMode", mode);
	},
	setPagePath(context, pagePath) {
		context.commit(SET_PAGE_PATH, pagePath)
	},
	setPageContent(context, pageContent) {
		context.commit(SET_PAGE_CONTENT, pageContent)
	},
	setSwitchPage({commit}, switchPage) {
		commit(SET_SWITCH_PAGE, switchPage);	
	},
	setPage({commit, dispatch}, page) {
		if (!page.path) {
			return;
		}

		dispatch("indexDB_savePage", page);
	},
	setPages({commit}, pages) {
		commit(SET_PAGES, pages);
	},
	loadPage(context, page) {
		let {commit, state, dispatch, getters:{getPageByPath}} = context;
		let {path} = page;
		let _loadPageFromServer = async function() {
			commit(SET_PAGE, {path:path, isRefresh:true});
			
			const result = await api.files.getFile({key:path});
			if (result.isErr()) {
				Message(result.getMessage());
				commit(SET_PAGE, {path:path, isRefresh:false});
				return;
			}
			const file = result.getData();
			page.hash = file.hash;
			if (typeof(file.content) != "string") {
				commit(SET_PAGE, {path:path, isRefresh:false});
				return;
			}
			page.content = typeof(file.content) == "string" ? file.content : JSON.stringify(file.content);
			page.isRefresh = false;
			commit(SET_PAGE, page);
			if (state.pagePath == path) {
				commit(SET_SWITCH_PAGE, true);
			}
		}
		let _loadPageFromDB = function(page) {
			if (state.pagePath == path) {
				commit(SET_SWITCH_PAGE, true);
			}
			commit(SET_PAGE, page);
		}
		g_app.pageDB.getItem(path).then(function(data){
			if (!data) {
				_loadPageFromServer();
				return;
			}
			var oldpage = getPageByPath(path);
			if (data.hash == oldpage.hash) {
				console.log("本地最新");
				_loadPageFromDB(data);

			} else if (data.hash != oldpage.hash && oldpage.isModify) {
				console.log("冲突");
				_loadPageFromDB(data);
			} else {
				console.log("服务器最新");
				_loadPageFromServer();
				return;
			}
		}, function() {
			_loadPageFromServer();
		})
	},
	async savePage(context, page) {
		let {path, content} = page;
		let {commit, getters, dispatch, state} = context;
		if (!path) {
			return;
		}
		const cachePage = state.pages[path] || {};
		let oper =  cachePage.sha ? "editFile" : "createFile";

		commit(SET_PAGE, {...page, isRefresh:true});

		const result = await api.files.uploadFile({
			key:path, 
			content: content,
			username: cachePage.username,
		});
		if (result.isErr()) {
			Message(result.getMessage());
		}
		const hash = result.getData().hash;
		//gitlab[oper](path, {
			//content:content,
			//commit_message: 'update with keepwork editor',
		//}).catch(function(){
		//});

		commit(SET_PAGE, {...page, hash, isRefresh:false});
		dispatch("indexDB_savePage", {...page, isModify:false});
	},
	async deletePage(context, page) {
		let {path} = page;
		let {commit, getters:{getGit}, dispatch} = context;

		if (!path) {
			return;
		}

		commit(SET_PAGE, {path:path, isRefresh:true});
		const result = await api.files.deleteFile({key:path});
		if (result.isErr()) {
			Message(result.getMessage());
		}

		//await gitlab.deleteFile(path, {
			//commit_message: 'delete by keepwork',
		//});
		commit(SET_PAGE, {path:path, isRefresh:false});

		dispatch("indexDB_deletePage", path);
		commit(DELETE_PAGE, path);
	},
};

export const mutations = {
	setTagId(state, tagId) {
		state.tagId = tagId;
	},
	setHoverTagId(state, tagId) {
		state.hoverTagId = tagId;
	},
	setTagPath(state, tagPath) {
		state.tagPath = tagPath;
	},
	setMode(state, mode) {
		state.mode = mode;
	},
	[SET_PAGE_PATH](state, pagePath) {
		vue.set(state, "pagePath", pagePath);		
	},
	[SET_PAGE_CONTENT](state, pageContent) {
		vue.set(state, "pageContent", pageContent);		
	},
	[SET_SWITCH_PAGE](state, switchPage) {
		vue.set(state, 'switchPage', switchPage);
	},
	[SET_PAGE](state, page) {
		vue.set(state.pages, page.path, {
			...(state.pages[page.path] || {}),
			...page,
		});
	},
	[DELETE_PAGE](state, path) {
		vue.delete(state.pages, path);
	},
	[SET_PAGES](state, pages) {
		vue.set(state, "pages", {
			...state.pages,
			...pages,
		});
	},
};

//export default {
	//state:state,
	//mutations: mutations,
	//actions: actions,
	//getters: getters,
//};
