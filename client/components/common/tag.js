import _ from "lodash";
import vue from "vue";
import {mapActions, mapGetters} from "vuex";
//import {create} from "jss";
//import preset from 'jss-preset-default'

import {tags} from "@/lib/tags";

const EDITOR_MODE_EDITOR = "editor";

let compiler = null;
if (process.server) {
	compiler = require('vue-template-compiler');
}

export default {
	name: "tag",
	inheritAttrs: false,
	data: function() {
		return {
			styles: {},
			classes:{
				tagActived:false,
				tagHover:false,
			},
			currentTag:null,
		};
	},
	props:{
		tag: {
			type:Object,
			default: function() {
				return tags.getTag("div");
			}
		},
		mode: {
			type: String,
			default: "normal",
		},
		tagName: {
			type:String,
			default:"div",
		},
	},

	computed: {
		tagStyle() {
			return {...this.tag.styles, ...this.styles};
		},
		tagClass() {
			return {...this.tag.classes, ...this.classes};
		},
		isActive() {
			if (this.mode != EDITOR_MODE_EDITOR) {
				return false;
			}
			if (this.currentTag && this.tag.tagId == this.currentTag.tagId) {
				return true;
			}

			return false;
		},
		attrStr(){
			return this.tag.getAttrsHtml(this.tagName);
		},
		compileTemplate() {
			var tagName = this.tagName;
			var attrStr = this.attrStr;
			var editorModeAttrStr = ' @click.stop.prevent="click" @click.native.stop.prevent="click" @mouseover.stop.prevent="mouseover" @mouseout.stop.prevent="mouseout"';
			if (this.mode != EDITOR_MODE_EDITOR) {
				editorModeAttrStr = "";
			}
			var attrStr = editorModeAttrStr + attrStr + ' :style="tagStyle" :class="tagClass" v-bind="$attrs" v-on="$listeners"';
			var template = '<' + tagName + attrStr + '>{{tag.text ||""}}<tag v-for="(x,index) in tag.children" :key="index" :tag="x" :tagName="x.tagName" :mode="mode"></tag></' + tagName + '>';
			if (tagName == "img" || tagName == "br" || tagName == "input") {
				template = '<' + tagName + attrStr + '/>';
			}	

			if (vue.compile) {
				return vue.compile(template);
			}
			return compiler.compileToFunctions(template);
		},
	},

	watch:{
		isActive: function(val, oldVal) {
			this.classes.tagActived = val;
		},
		//hoverTagId: function(tagId, oldTagId) {
			//if (this.tag.tagId == tagId) {
				//this.classes.tagHover = true;
			//} else {
				//this.classes.tagHover = false;
			//}
			//this.oldHoverTagId = oldTagId;
		//},
	},

	render(arg1, arg2, arg3, arg4) {
		var res = this.compileTemplate;
		this.compileRender = res.render;

		return this.compileRender(arg1,arg2,arg3,arg4);
	}, 
	staticRenderFns(arg1, arg2, arg3, arg4) {
		var res = this.compileTemplate;
		this.compileStaticRenderFns = res.staticRenderFns;

		return this.compileStaticRenderFns(arg1,arg2,arg3,arg4);
	},
	
	methods: {
		click() {
			this.emit(this.EVENTS.__EVENT__TAG__CURRENT_TAG__, {tag:this.tag})
		},
		mouseover() {
			//this.setHoverTagId(this.tag.tagId);
		},
		mouseout() {
			//this.setHoverTagId(undefined);
		},
	},

	mounted() {
		const self = this;
		self.on(self.EVENTS.__EVENT__TAG__CURRENT_TAG__, function(data) {
			self.currentTag = data.tag;
		});
	},

	created(){
		var self = this;
		var tag = this.tag;
		var subtag = undefined;
		var vnodes = this.$slots.default || [];

		tag.setTagName(this.tagName);
		//console.log(vnodes, tag.tagId);
	
		var _vnodeToTag = function(tag, vnodes) {
			if (!vnodes) {
				return;
			}
			for (var i = 0; i < vnodes.length; i++) {
				var vnode = vnodes[i];
				var options = vnode.componentOptions;

				if (!options) {
					tag.text = vnode.text;
					//var subtag = tags.spanTag(vnode.text);
					//subtag.isVnode = true;
					//tag.addTag(subtag);
					continue;
				}

				var tagName = options.tag;
				var subtag = tags.getTag(tagName);
				_.merge(subtag.attrs, options.propsData);					
				if (vnode.data && vnode.data.attrs) {
					_.merge(subtag.attrs, vnode.data.attrs);					
				}
				subtag.isVnode = true;
				tag.addTag(subtag);

				_vnodeToTag(subtag, options.children);
			}
		}

		if (!tag.isVnode) {
			_vnodeToTag(tag, vnodes);
		}
	},
	components: {
		//...mods,
	},
}

