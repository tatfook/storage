<template>
	<div class="layoutContainer">
		<div class="headerContainer">
			<div class="container full-height">
				<div style="position:relative; padding:10px;">
					<el-button @click="clickSaveBtn" :size="btnSize" round plain type="text" :icon="page.isRefresh ? 'el-icon-loading' : page.isModify ? 'iconfont icon-edit' : 'iconfont icon-save'"></el-button>
					<el-button-group v-if="isSmallScreen">
						<el-button round :type="viewMode == 'files' ? 'primary' : 'text'" @click="clickViewModelBtn('files')":size="btnSize" icon="iconfont icon-files"></el-button>
						<el-button round :type="viewMode == 'code' ? 'primary' : 'text'" @click="clickViewModelBtn('code')" :size="btnSize" icon="iconfont icon-code"></el-button>
						<el-button round :type="viewMode == 'preview' ? 'primary' : 'text'" @click="clickViewModelBtn('preview')":size="btnSize" icon="iconfont icon-preview"></el-button>
					</el-button-group>

					<div style="position:absolute; top: 15px; right:10px;">
						<user-link></user-link>
					</div>
				</div>
			</div>
		</div>
		<div class="mainContainer">
			<el-container v-if="isSmallScreen">
				<left v-show="viewMode == 'files'"></left>
				<code-editor v-show="viewMode == 'code'" ref="codemirror"></code-editor>
				<div v-show="viewMode== 'preview'" class="preview-container">
					<markdownEx :template="true"></markdownEx>
				</div>
			</el-container>
			<el-container v-else 
				@mouseup.native="splitStripMouseup"
				@mousemove.native="splitStripMousemove"
				@mouseleave.native="splitStripMouseup">
				<el-aside ref="splitStrip1" :width="splitStrip1_width">
					<left></left>
				</el-aside>
				<el-container ref="splitStrip1R">
					<div class="split-strip kp_forbit_copy hidden-xs-only" @mousedown="splitStripMousedown('splitStrip1')"></div>
					<el-aside ref="splitStrip2" :width="splitStrip2_width">
						<code-editor ref="codemirror"></code-editor>
					</el-aside>
					<div class="split-strip kp_forbit_copy" @mousedown="splitStripMousedown('splitStrip2')"></div>
					<el-main ref="splitStrip2R" class="preview-container">
						<markdownEx :template="true"></markdownEx>
					</el-main>
				</el-container>
			</el-container>
		</div>
	</div>
</template>

<script>
import {
	Container,
	Header,
	Aside,
	Main,
	ButtonGroup,
} from "element-ui";
import vue from "vue";
import lodash from "lodash";

import api from "@@/common/api/note.js";
import {tags} from "@/lib/tags";
import userpage from "@/components/bases/userpage.vue";
import markdownEx from "@/components/bases/markdownEx.vue";
import left from "@/components/views/left.vue";
import codeEditor from "@/components/views/codeEditor.vue";
//import "@/components";

import UserLink from  "@/components/bases/userLink.vue";

export default {
	components: {
		[Container.name]:Container,
		[Header.name]:Header,
		[Aside.name]:Aside,
		[Main.name]:Main,
		[ButtonGroup.name]: ButtonGroup,
		left,
		codeEditor,
		userpage,
		markdownEx,
		UserLink,
	},
	middleware: "authenticated",
	layout: "editor",
	data: function() {
		return {
			viewMode:"code",
			isSmallScreen: false,
			splitStrip1_width:"350px",
			splitStrip2_width:"50%",
			value:undefined,
			mode:"editor",
			text:"",
			themeContent: "",
			themes:{},
			page: {isRefresh:false, isModify:false},
		}
	},
	computed: {
		btnSize() {
			return "small";
			return this.isSmallScreen ? "mini" : "small"
		},

		renderContent() {
			return this.pageContent;
			const content = this.themeContent ? (this.themeContent + "\n" + this.pageContent) : this.pageContent;

			return content;
		},
		codemirror() {
			return this.$refs.codemirror.codemirror;
		},
	},
	watch:{
	},
	methods: {
		clickViewModelBtn(mode) {
			const self = this;
			self.viewMode = mode;
			const timer = setInterval(()=> {
				if (!self.codemirror) return;
				clearInterval(timer);

				const doc = self.codemirror.getDoc();
				doc.setCursor(doc.getCursor());
			}, 10);
		},

		splitStripMousedown(typ) {
			var el = this.$refs[typ].$el;
			this.splitStrip = {
				el: el,
				rel: this.$refs[typ+"R"].$el,
				parentEl: el.parentElement,
				typ: typ,
				key: typ + "_width",
				startX: event.clientX,
				leftWidth: el.offsetWidth,
			};
			//console.log(event, typ, this.splitStrip);
		},
		splitStripMousemove() {
			if (!this.splitStrip) {
				return;
			}

			// 移动的时候显示
			this.splitStrip.el.style.display = "";

			let key = this.splitStrip.key;
			let startX = this.splitStrip.startX;
			let leftWidth = this.splitStrip.leftWidth;
			let newLeftWidth = leftWidth + event.clientX - startX;
			let parentWidth = this.splitStrip.parentEl.offsetWidth;
			if (parentWidth - newLeftWidth > 50) {
				this.splitStrip.rel.style.display = "";
			}

			if (this.splitStrip.typ == "splitStrip1" && newLeftWidth > 500) {
				newLeftWidth = 500;
			}
			
			this[key] = newLeftWidth + "px";
			this.splitStrip.newLeftWidth = newLeftWidth;
		},
		splitStripMouseup() {
			if (!this.splitStrip) {
				return;
			}
			const minWidths = {"splitStrip1": 200, "splitStrip2": 300};
			let key = this.splitStrip.typ + "_width";
			let minWidth = minWidths[this.splitStrip.typ];
			let newLeftWidth = this.splitStrip.newLeftWidth;
			let parentWidth = this.splitStrip.parentEl.offsetWidth;
			
			this[key] = newLeftWidth + "px";

			if (newLeftWidth < minWidth) {
				this.splitStrip.el.style.display = "none";
				this[key] = "0px";
			}

			if ((parentWidth - newLeftWidth) < minWidth) {
				this[key] = parentWidth - 10 + "px";
				this.splitStrip.rel.style.display = "none";
			}

			this.splitStrip = undefined;
		},
		addTag(tag, node, nodeComp) {
			this.mode = "test";
			if (!tag.type) {
				return;
			}
			const subTag = tags.getTag(tag.type);
			//if (tag.type.indexOf("Adi") == 0){
			//	subTag.vars = adi.getComponentProperties(tag.type);
			//}
			this.tag.addTag(subTag);	
		},
		selectTag(tag) {
			this.tag = tag;
			tag && this.setTagId(tag.tagId);
		},
		clickSaveBtn() {
			this.emit(this.EVENTS.__EVENT__CODEMIRROR__IN__SAVE__);
		}
	},
	mounted() {
		const self = this;
		self.isSmallScreen = window.innerWidth < 768;
		window.onresize = () => {
			self.isSmallScreen = window.innerWidth < 768;
		}

		self.on(self.EVENTS.__EVENT__CODEMIRROR__OUT__TEXT__, function(data) {
			self.emit(self.EVENTS.__EVENT__MARKDOWN_EX__IN__TEXT__, data);
		});
		self.on(self.EVENTS.__EVENT__FILETREE__OUT__PAGE__, function(data){
			_.merge(self.page, data.page);
			self.emit(self.EVENTS.__EVENT__CODEMIRROR__IN__PAGE__, data);
		});
		self.on(self.EVENTS.__EVENT__EDITOR__CURRENT__PAGE__, function(data) {
			_.merge(self.page, data);
		});
	},
}
</script>

<style>
html,body, .el-container, .el-aside {
	height:100%;
}
html, body {
	margin: 0px;
}
.active-btn {
	background-color: blue;
}
.layoutContainer {
	height: 100%;
}
.headerContainer {
	height: 60px;
	background-color: rgb(248,248,248);
}
.mainContainer {
	position: absolute;
	left: 0px;
	right: 0px;
	top:60px;
	bottom: 0px;
}
.v-center {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.flex-row {
	display: flex;
	justify-content: flex-end;
	padding-right: 10px;
}
.preview-container {
	overflow-y:auto; 
}
.preview-container::-webkit-scrollbar {
	display: none;
}
.vue-codemirror {
	height:100%;
}
.el-container, .el-aside {
	overflow-y: hidden;
}

#editorContainer {
	height:100%;
}

.split-strip {
	height:100%;
	width: 5px;
	background-color:rgb(168,168,168);
	cursor: col-resize;
}
.CodeMirrorFold {
	background-color: #F5F5F5;
}
.CodeMirror-vscrollbar {
	overflow-y: hidden;
}
</style>
