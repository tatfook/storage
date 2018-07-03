<template>
	<div class="kp_forbit_copy" style="margin-bottom:60px">
		<el-dialog :visible.sync="isShowNewFile" title="新增文件" width="500px">
			<el-form :model="newFileForm" label-width="80px" label-position="right" style="width:300px;">
				<el-form-item label="类型">
					<el-select v-model="newFileForm.type" placeholder="请选择类型">
						<el-option label="文件" value="pages"></el-option>
						<el-option label="目录" value="folders"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="文件名">
					<el-input v-model="newFileForm.filename" 
						placeholder="请输入文件名" 
						@keyup.native.enter="clickSubmitNewFileBtn"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer" v-loading="newFileForm.isLoading">
		        <el-button @click="isShowNewFile = false">取 消</el-button>
				<el-button type="primary" @click="clickSubmitNewFileBtn">确 定</el-button>
			</div>
		</el-dialog>
		<el-tree ref="openedTreeComp" :data="openedPageTree"  :props="treeprops" node-key="path" :default-expand-all="true" :highlight-current="true" @node-click="clickSelectPage">
			<span class="custom-tree-node" slot-scope="{node, data}">
				<span v-if="data.type == 'folders'" class="custom-tree-node">
					<span>
						<!--<i class="iconfont icon-folder"></i>-->
						<span>{{data.label}}</span>
					</span>
				</span>
				<span v-if="data.type == 'pages'" class="custom-tree-node">
					<span class="tree-node-text">
						<i v-show="node.isConflict" @click="clickFixedConflict(data)" class="fa fa-warning" aria-hidden="true" data-toggle="tooltip" title="冲突"></i>
						<i v-show="!node.isConflict" :class='(node.isRefresh || data.isRefresh) ? "el-icon-loading" : (node.isModify || data.isModify) ? "iconfont icon-edit" : "iconfont icon-file"'></i>
						<span>{{data.label}}</span>
					</span>
					<span class="tree-node-btn-group">
						<i @click.stop="clickOpenBtn(data)"class="iconfont icon-open" aria-hidden="true" data-toggle="tooltip" title="访问"></i>
						<!--<i @click.stop="clickGitBtn(data)" class="fa fa-git" aria-hidden="true" data-toggle="tooltip" title="git"></i>-->
						<i @click.stop="clickCloseBtn(data)" class="iconfont icon-close" aria-hidden="true" data-toggle="tooltip" title="关闭"></i>
					</span>
				</span>
			</span>
		</el-tree>
		<el-tree ref="filetree" lazy :load="loadTreeNode" :props="treeprops"
			node-key="path" :highlight-current="true" @node-click="clickSelectPage">
			<span class="custom-tree-node" slot-scope="{node, data}">
				<span v-if="data.type == 'folders'" class="custom-tree-node">
					<span>
						<!--<i class="iconfont icon-folder"></i>-->
						<span>{{data.label}}</span>
					</span>
					<span v-if="node.level != 1">
						<i v-if="node.loaded && node.childNodes.length == 0"class="iconfont icon-delete" @click.stop="clickDeleteBtn(data, node)"></i> 
						<i class="iconfont icon-plus" @click.stop="clickNewFileBtn(data, node)"></i> 
					</span>
				</span>
				<span v-if="data.type == 'pages'" class="custom-tree-node">
					<span class="tree-node-text">
						<i v-show="node.isConflict" @click="clickFixedConflict(data)" class="fa fa-warning" aria-hidden="true" data-toggle="tooltip" title="冲突"></i>
						<i v-show="!node.isConflict" :class='node.isRefresh ? "el-icon-loading" : node.isModify ? "iconfont icon-edit" : "iconfont icon-file"'></i>
						<span>{{data.label}}</span>
					</span>
					<span class="tree-node-btn-group">
						<i @click.stop="clickOpenBtn(data)"class="iconfont icon-open" aria-hidden="true" data-toggle="tooltip" title="访问"></i>
						<!--<i @click.stop="clickGitBtn(data)" class="fa fa-git" aria-hidden="true" data-toggle="tooltip" title="git"></i>-->
						<i @click.stop="clickDeleteBtn(data, node)" class="iconfont icon-delete" aria-hidden="true" data-toggle="tooltip" title="删除"></i>
					</span>
				</span>
			</span>
		</el-tree>
	</div>
</template>


<script>
import {
	Form,
	FormItem,
	Input,
	Button,
	Dialog,
	Select,
	Option,
	Tree,
	Loading,
	Message,
} from "element-ui";
import vue from "vue";
import _ from "lodash";
import config from "@/config.js";
import util from "@@/common/util.js";

vue.use(Loading.directive);

export default {
	components:{
		[Button.name]: Button,
		[Form.name]: Form,
		[FormItem.name]: FormItem,
		[Dialog.name]: Dialog,
		[Select.name]: Select,
		[Option.name]: Option,
		[Tree.name]: Tree,
		[Input.name]: Input,
	},
	data: function(){
		return {
			openedPages:{},
			isShowNewFile:false,
			newFileForm:{ type:"pages", isLoading:false },
			sites: {},
			pages: {},
			treeprops: {
				isLeaf: (data, node) => {
					return data.type == "pages";
				}
			}
		};
	},

	computed: {
		username() {
			return this.user.username;
		},

		openedPageTree() {
			let tree = {label:"已打开页面", type:"folders", path:"",children:[]};
			for (var key in this.openedPages) {
				if (!this.openedPages[key]) {
					continue;
				}
				tree.children.push(this.openedPages[key]);
			}
			return [tree];
		},
	},

	methods: {
		getPageByPath(path) {
			return this.pages[path];
		},

		async getSites() {
			const self = this;
			let result = await this.api.sites.get({owned: true});
			const sites = result.getData() || [];
			sites.forEach(site => {
				site.name = site.sitename;
				site.type = "folders";
				site.path = self.user.username + "/" + site.sitename;
				this.sites[site.sitename] = site;
			});
			return sites;
		},

		fileToPage(file) {
			const self = this;
			const key = file.key;
			const path = util.getPathByKey(key);
			const paths = path.split("/");
			const page = {};
			const type = _.endsWith(key, ".md") ? "pages" : "folders";
			page.key = key;
			page.path = path;
			page.hash = file.hash;
			page.label = _.endsWith(key, ".md") ? paths[paths.length-1] : paths[paths.length-2];
			page.type = type;
			page.username = paths[0];
			page.label = page.label.replace(/\..*$/, "");
			page.folder = util.getFolderByKey(key);

			page.setRefresh = function(x){
				const key = this.path;
				let node = self.$refs.filetree.getNode(key);
				vue.set(node || {}, "isRefresh", x);
				node = self.$refs.openedTreeComp.getNode(key);
				vue.set(node || {}, "isRefresh", x);

				vue.set(this, "isRefresh", x);
				//this.isRefresh = x;
			}
			page.setModify = function(x) {
				const key = this.path;
				let node = self.$refs.filetree.getNode(key);
				vue.set(node || {}, "isModify", x);
				node = self.$refs.openedTreeComp.getNode(key);
				vue.set(node || {}, "isModify", x);

				vue.set(this, "isModify", x);
				//this.isModify = x;
			}

			self.pages[path] = page;
			//console.log(page);
			return page;
		},

		async loadTreeNode(node, resolve) {
			const self = this;
			const username = self.user.username;
			const userId = self.user.id;
			//console.log(node);	
			if (node.level == 0) {
				return resolve([{
					label: "我的站点",
					path: username + "/",
					key: username + "/pages/",
					type: "folders",
					username,
				}, {
					label: "参与站点",
					path: "joins/",
					key: "joins/pages/",
					type: "folders",
				}]);
			} else if(node.level == 1){
				const data = node.data;
				let sites = undefined;
				const pages = [];
				if (data.username) {
					sites = await self.api.sites.get();
				} else {
					sites = await self.api.sites.getJoinSites({level:40});
				}
				sites = sites.getData() || [];
				_.each(sites, site => {
					//console.log(username, site.username, site.userId, userId);
					const key = (site.userId == userId ? username : site.username) + "/pages/" + site.sitename + "/"; 
					pages.push(self.fileToPage({key, hash:0}));
				});
				//console.log(sites);
				return resolve(pages);
			}

			const nodeData = node.data;
			const nodeKey = nodeData.key;

			const result = await this.api.pages.search({folder:nodeKey});
			const files = result.getData() || [];
			const nodes = [];

			for (let i = 0; i < files.length; i++) {
				nodes.push(self.fileToPage(files[i]));
			}

			resolve(nodes);
		},

		loadPage(page, cb, errcb) {
			const self = this;
			let _loadPageFromServer = async function() {
				console.log("服务器最新");
				const result = await self.api.pages.getByKey({key:page.key});
				const file = result.getData();
				if (!file && result.isErr()) {
					Message(result.getMessage());
					errcb && errcb();
					return;
				}
				page.hash = file.hash;
				if (typeof(file.content) != "string") {
					errcb && errcb();
					return;
				}
				page.content = file.content;
				cb && cb();
			}
			g_app.pageDB.getItem(page.path).then(function(data){
				if (!data) {
					_loadPageFromServer();
					return;
				}
				if (data.hash == page.hash || page.isModify) {
					if (data.hash == page.hash) {
						console.log("本地最新");
					} else {
						console.log("冲突");
					}
					_.merge(page, data);
					cb && cb();
					return;
				} 

				_loadPageFromServer();
			}, function() {
				_loadPageFromServer();
			})
		},

		clickSelectPage(data, node) {
			var self = this;
			// 激活文件树项
			self.setCurrentItem(data.path);
			if (data.type == "folders") {
				return;
			}

			// 添加打开列表

			const path = data.path;
			const page = this.getPageByPath(path);
			if (!page) return ;

			self.$set(self.openedPages, page.path, page);

			const finish = function() {
				page.setRefresh(false);
				page.setModify(page.isModify);
				window.location.hash = "#" + path.substring(0, path.length - config.pageSuffix.length);
				// 设置当前page
				self.emit(self.EVENTS.__EVENT__FILETREE__OUT__PAGE__, {
					namespace: self.namespace,
					page: page,
				});
				self.page = page;
			}

			if (page.content == undefined) {
				page.setRefresh(true);
				this.loadPage(page, function() {
					finish();
				}, function(){
					finish();
				});
			} else {
				finish();
			}
		},
		clickCloseBtn(data) {
			const self = this;
			this.$delete(this.openedPages, data.path);
			if (data.path == this.page.path) {
				this.emit(this.EVENTS.__EVENT__FILETREE__OUT__PAGE__, {
					namespace: self.namespace,
					page: {},
				});
				let curKey = data.path.replace(/\/[^\/]*$/, "");
				this.setCurrentItem(curKey);
		   } else {
				this.setCurrentItem(this.pagePath);
		   }
		},
		setCurrentItem(path) {
			var self = this;
			setTimeout(function(){
				//console.log(path);
				self.$refs.filetree.setCurrentKey(path);
				self.$refs.openedTreeComp.setCurrentKey(path);
			}, 10);	
		},
		clickOpenBtn(data) {
			window.open(window.location.origin + "/" + data.path.replace(/\..*$/,""));
		},
		clickNewFileBtn(data, node) {
			this.isShowNewFile = true;
			this.newFileForm.data = data;
		},
		async clickSubmitNewFileBtn() {
			const self = this;
			const form = this.newFileForm;
			if (!form.filename) {
				this.$message("文件名不能为空");
				return;
			}
			const node = this.newFileForm.data;
			let path = node.path + form.filename + (form.type == "folders" ? "/" : ".md");
			const page = this.getPageByPath(path);
			if (page && page.path) {
				this.$message("文件已存在");
				return;
			}
			let file = {
				key: util.getKeyByPath(path, "pages"),
			    type:form.type,
			    content:"",
			}
			let newpage = self.fileToPage(file);
			newpage.content = "";
			//console.log(newpage);
			self.pages[newpage.path] = newpage;
			form.isLoading = true;
			await self.api.pages.upsert(newpage);
			self.$refs.filetree.append(newpage, node.path);
			this.isShowNewFile = false;
			form.isLoading = false;
		},
		async clickDeleteBtn(data, node) {
			const path = data.path;
			const page = this.getPageByPath(path);
			page.setRefresh(true);
			//if (page.type == "folders") {
				//console.log(node);
				//return ;
			//}
			const result = await this.api.pages.deleteByKey({key:page.key});
			if (result.isErr()) {
				Message(result.getMessage());
			}
			g_app.pageDB.deleteItem(path);
			delete this.openedPages[path];
			delete this.pages[path];
			this.$refs.filetree.remove(path);
			this.$refs.openedTreeComp.remove(path);
			page.setRefresh(false);
		},
	},

	mounted() {
	},

	created() {
	}
}
</script>

<style scoped>
.custom-tree-node {
	flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
.custom-tree-node i {
	margin-right:2px;
}
.tree-node-text {
	flex:8;
	text-overflow:ellipsis;
	overflow-x: hidden;
}
.tree-node-btn-group {
	flex:2;
	display:none;
}
.custom-tree-node:hover .tree-node-btn-group {
	display:flex;
	justify-content:flex-end;
}
</style>
