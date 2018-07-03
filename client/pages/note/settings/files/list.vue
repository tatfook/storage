<template>
	<div>
		<el-dialog :visible.sync="isShowNewFolder" title="新增目录" width="500px">
			<el-form :model="folder" label-width="80px" label-position="right" style="width:300px;">
				<el-form-item label="目录名">
					<el-input v-model="folder.filename" placeholder="请输入目录名"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer" v-loading="folder.isLoading">
		        <el-button @click="isShowNewFolder = false">取 消</el-button>
				<el-button @click="clickSubmitNewFolderBtn">确 定</el-button>
			</div>
		</el-dialog>

		<el-row>
			<el-col :span="4">
				<el-tree ref="filetree"  node-key="key" :highlight-current="true" 
					lazy :load="loadTreeNode"
					@node-click="clickSelectNode">
					<span class="custom-tree-node" slot-scope="{node, data}">
						<span>
							<!--<i class="iconfont icon-folder"></i>-->
							<span>{{data.label}}</span>
						</span>
						<span>
							<i class="iconfont icon-plus" @click.stop="clickNewFolderBtn(data, node)"></i> 
						</span>
					</span>
				</el-tree>
			</el-col>
			<el-col :span="20">
				<el-table :data="nodeFiles">
					<el-table-column width="300px" prop="key" label="KEY"></el-table-column>
					<el-table-column prop="size" label="大小"></el-table-column>
					<el-table-column prop="type" label="类型"></el-table-column>
					<el-table-column fixed="right" label="操作">
						<template slot-scope="{row, $index}">
							<i @click="clickCopyBtn(row, $index)" class="iconfont icon-link" aria-hidden="true" data-toggle="tooltip" title="删除"></i>
							<i @click="clickDeleteBtn(row, $index)" class="iconfont icon-delete" aria-hidden="true" data-toggle="tooltip" title="删除"></i>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>
	</div>
</template>

<script>
import {
	Form,
	FormItem,
	Input,
	Dialog,
	Row,
	Col,
	Tree,
	Button,
	Table,
	TableColumn,
	Message,
} from "element-ui";
import axios from "axios";
import vue from "vue";
import vueClipboard from 'vue-clipboard2';
import {mapActions, mapGetters} from "vuex";
import util from "@@/common/util.js";
import qiniuUpload from "@@/common/api/qiniu.js";
import api from "@@/common/api/note.js";
import config from "@/config.js";

vue.use(vueClipboard);

export default {
	components: {
		[Form.name]: Form,
		[FormItem.name]: FormItem,
		[Input.name]: Input,
		[Dialog.name]: Dialog,
		[Row.name]: Row,
		[Col.name]: Col,
		[Tree.name]: Tree,
		[Button.name]: Button,
		[Table.name]: Table,
		[TableColumn.name]: TableColumn,
	},

	data: function() {
		return {
			isShowNewFolder: false,
			currentKey:"",
			folder: {},
			files:[],
			trees: [],
		}
	},

	computed: {
		nodeFiles() {
			const nodes = [];
			const files = this.files;
			for (let i = 0; i < files.length; i++) {
				if (files[i].folder == this.currentKey) {
					nodes.push(files[i]);
				}
			}

			return nodes;
		}
	},

	methods: {
		async clickSubmitNewFolderBtn() {
			const self = this;
			if (!this.folder.filename.trim()) {
				Message("目录名不能为空");
				return;
			}

			const folder = this.folder;
			const filename = folder.filename.trim();
			const blob = new Blob(["this is a folder"], {type: "text/plain"}); 
			const parentKey = folder.key;
			const key = parentKey + filename + "/";

			const ok = await qiniuUpload(key, blob);
			this.isShowNewFolder = false;

			if (!ok) {
				Message("创建目录失败")
				return;
			}

			const node = self.$refs.filetree.getNode(parentKey);
			const newNode = {
				key: key,
				label: filename,
			}
			self.$refs.filetree.append(newNode, node);
			const treestr = JSON.stringify(self.trees);
			qiniuUpload(self.key, treestr);
		},
		clickNewFolderBtn(data) {
			this.folder.key = data.key;
			this.isShowNewFolder = true;
		},
		clickSelectNode(data){
			this.currentKey = data.key;
		},
		async loadTreeNode(node, resolve) {
			const self = this;
			const username = self.user.username;
			
			console.log(node);	
			if (node.level == 0) {
				return resolve([{
					label:username,
					key: username + "/",
				}]);
			} 

			const nodeData = node.data;
			const nodeKey = nodeData.key;
			const result = await this.api.files.get({
				folder:nodeKey,
			});
			const files = result.getData() || [];
			const nodes = [];

			for (let i = 0; i < files.length; i++) {
				let file = files[i];
				let key = file.key;

				if (file.type == "folders") {
					nodes.push({
						label: key.substring(nodeKey.length, key.length-1),
						key:key,
					});
				} else {
					self.files.push(file);
				}
				
			}

			resolve(nodes);
		},
		async getFileList(prefix) {
			let result = await this.api.files.get({raw:true, prefix});
			if (result.isErr()) {
				console.log(result);
				return [];
			}
			
			return result.getData();
		},
		clickCopyBtn(raw) {
			const path = raw.path || util.getPathByKey(raw.key);
			const url = config.origin + "/" + path;
			this.$copyText(url).then(function(e) {
				Message("连接复制到剪切板成功");
			}, function(e){
				Message("连接复制到剪切板失败");
			});
		},

		async clickDeleteBtn(raw, index) {
			let result = await api.files.delete(raw);
			if (result.isErr()) {
				Message(result.getMessage());
				return;
			}

			this.files.splice(index, 1);
		}
	},

	async mounted() {
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
</style>
