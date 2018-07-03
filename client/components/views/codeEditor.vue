<template>
	<div style="height:100%; width:100%" v-loading="loading" element-loading-text="文件上传中...">
		<el-dialog title="文件上传" :visible.sync="fileUploadDialogVisible" width="500px">
			<div style="color:red; margin-top:-20px; margin-bottom:10px"><b>存在同名文件会覆盖</b></div>
			<el-input v-model="uploadFilename" placeholder="请输入文件名"></el-input>
			<span slot="footer">
				<el-button @click="fileUploadDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="fileUpload">确定</el-button>
			</span>
		</el-dialog>
		<codemirror ref="cm" :value="value" class="kp_forbit_copy" @change="textChange" @save="save" @fileUpload="fileUploadEvent" @cursorActivity="cursorActivity">
		</codemirror>
	</div>
</template>

<script>
import vue from "vue";
import {Base64} from "js-base64";
import {
	Dialog,
	Input,
	Button,
	Message,
} from "element-ui";

import codemirror from "@/components/bases/codemirror.vue";
import qiniuUpload from "@@/common/api/qiniu.js";
import api from "@@/common/api/note.js";
import util from "@@/common/util.js";
const tempContentKey = "cmeditor_temp_content";

export default {
    components:{
		[Dialog.name]: Dialog,
		[Input.name]: Input,
		[Button.name]: Button,
		codemirror,
    },
	data: function() {
		return {
			fileUploadDialogVisible: false,
			uploadFilename:"",
			loading: false,
			value:{
				text:"",
				filename:null,
			},
			pages:{},
			change: {
				timer:undefined,
				filename:undefined,
			},
		};
	},

	computed: {
		codemirror() {
			return this.$refs.cm && this.$refs.cm.codemirror;
		},
	},

	methods: {
		savePageToDB(){
			if (!this.page || !this.page.path || !this.page.isModify) return ;
			
			this.change.timer && clearTimeout(this.change.timer);
			g_app.pageDB.setItem(this.page);
		},

		textChange(payload) {
			var self = this;
			self.emit(self.EVENTS.__EVENT__CODEMIRROR__OUT__TEXT__, {
				namespace: self.namespace,
				text: payload.text,
			});
			if (!payload.filename) {
				this.storage && this.storage.sessionStorageSetItem(tempContentKey, payload.text);
				return;
			}

			if (this.change.filename != payload.filename) {
				this.change.filename = payload.filename;
				// 立即保存切换的后的内容
				self.savePageToDB();
				//self.save();
				self.change.timer && clearTimeout(self.change.timer);
			} else {
				const isModify = this.page.content != payload.text;
				if (self.page.isModify != isModify) {
					self.page.setModify(isModify);
					self.emit(self.EVENTS.__EVENT__EDITOR__CURRENT__PAGE__, {isModify});
				}

				self.change.timer && clearTimeout(self.change.timer);
				self.change.timer = setTimeout(function(){
					self.savePageToDB();
					//self.save();
				}, 20000);
			}

			this.page.content = payload.text;
			this.page.cursor = this.codemirror.getDoc().getCursor();
		},

		async save() {
			if (!this.page || !this.page.path || !this.page.isModify) return ;

			this.page.hash = util.hash(this.page.content);
			this.page.setRefresh(true);
			const result = await this.api.pages.upsert(this.page);
			if (!result) {
				Message("文件保存失败");
				return;
			}
			this.page.setRefresh(false);
			this.page.setModify(false);
			this.emit(this.EVENTS.__EVENT__EDITOR__CURRENT__PAGE__, {isModify:false});
			g_app.pageDB.setItem(this.page);
		},

		fileUploadEvent(file) {
			this.fileUploadDialogVisible = true;
			this.uploadFilename = file.name;
			this.file = file;
		},

		async fileUpload() {
			this.fileUploadDialogVisible = false;
			if (!this.uploadFilename){
				Message("文件名为空, 取消文件上传");
				return;
			};
			const file = this.file;
			const filename = this.uploadFilename;
			const isImage = file.type.indexOf("image") == 0;
			let username = this.user.username;
			let sitename = undefined;
			let path = undefined;
			if (this.page && this.page.path) {
				const paths = this.page.path.split("/");
				username = paths[0];
				sitename = paths[1];
				path = [username, sitename, filename].join("/");	
			} else {
				path = [username, filename].join("/");	
			}
			const key = util.getKeyByPath(path);
			this.loading = true;
			const ok = await qiniuUpload(key, file, null, {
				username,
				sitename,
				filename,
			});

			if (ok) {
				const url = ok.url;
				const cmComp = this.$refs.cm;
				let content = '['+ this.uploadFilename +'](' + url+')'; 
				if (isImage){
					content = "!" + content;	
				}
				cmComp.insertContent(content);
			}

			this.loading = false;
		},

		cursorActivity() {
			const self = this;
			if (!self.page) return ;

			self.page.cursor = self.codemirror && self.codemirror.getDoc().getCursor();
		},
	},

	mounted() {
		const self = this;
		this.storage = g_app.storage;
		this.value = {
			text:this.storage && this.storage.sessionStorageGetItem(tempContentKey) || (""),
			filename:null,
		}
		g_app.vue.$on(g_app.consts.EVENT_ADD_MOD_TO_EDITOR, function(style){
			self.value = self.$refs.cm.getValue();
			self.value.text += '\n```@' + style.modName + '/' + style.styleName + '\n' +'```\n';
		});

		self.on(self.EVENTS.__EVENT__CODEMIRROR__IN__SAVE__, function() {
			self.save();
		});

		self.on(self.EVENTS.__EVENT__CODEMIRROR__IN__PAGE__, function(data) {
			if (self.namespace != data.namespace) return;
			const page = data.page;

			self.page = page;
			self.value =  {
				filename: page.path,
				text: page.content || "",
				cursor: page.cursor,
			}
			self.savePageToDB();
		});
	},

	created() {
	},

}
</script>
