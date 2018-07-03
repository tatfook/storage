<template>
	<el-tree
		ref="tree"
	   	:data="[rootTag]" 
		draggable
		:allow-drag="allowDrag"
		:allow-drop="allowDrop"
		:props="treeProps" 
		:expand-on-click-node="false" 
		:highlight-current="true" 
		node-key="tagId" 
		@node-click="clickSelectTag" 
		:default-expand-all="true">
		<span :style="customTreeNodeStyle" slot-scope="{ node, data }">
			<span @click="clickSelectTag(data, node)">{{data.aliasname || data.name || data.key || data.tagName}}</span>
			<span v-show="!isRootNode(data)" class="node-btn-container">
				<!--<i @click.stop="clickAddTag(data)" class="iconfont icon-plus" data-toggle="tooltip" title="添加"></i>-->
				<!--<i @click.stop="clickDeleteTag(data)" class="iconfont icon-minus" data-toggle="tooltip" title="删除"></i>-->
				<i @click.stop="clickAddTag(data)" class="el-icon-plus" data-toggle="tooltip" title="添加"></i>
				<i @click.stop="clickDeleteTag(data)" class="el-icon-minus" data-toggle="tooltip" title="删除"></i>
			</span>
		</span>
	</el-tree>
</template>

<script>
import {
	Tree,
} from "element-ui";
import vue from "vue";
import {mapActions, mapGetters} from "vuex";
import tags from "@/lib/tags";

export default {
	components: {
		[Tree.name]: Tree,
	},

	data: function() {
		return {
			treeProps: {
				label:function(data, node) {
					return data.name || data.tagName;
				},
				children:"children",
			},
			customTreeNodeStyle : {
				"flex": "1",
				"display": "flex",
				"align-items": "center",
				"justify-content": "space-between",
				"font-size": "14px",
				"padding-right": "8px",
			}
		}
	},
	props: {
		rootTag: {
			type:Object,
		},
	},
	computed: {
		navTagList() {
			if (!this.tag) {
				return;
			}
			var navTagList = [];
			var tmpTag = this.tag;
			var count = 0;
			while(tmpTag) {
				navTagList.push(tmpTag);
				tmpTag = tmpTag.parentTag;
				count++;
				if (count == 2) {
					break;
				}
			}
			navTagList.reverse();
			return navTagList;
		},
	},
	watch:{
	},
	methods: {
		allowDrag(draggingNode) {
			return true;
		},
		allowDrop(draggingNode, dropNode) {
			return dropNode.data.isContainerTag();
		},
		clickSelectTag(tag, node) {
			this.emit(this.EVENTS.__EVENT__TAG__CURRENT_TAG__, {tag});
		},
		isRootNode(tag) {
			if (!this.rootTag || this.rootTag.tagId == tag.tagId) {
				return true;
			}

			return false;
		},
		clickAddTag(tag) {
			const cloneTag = tags.getTagByTag(tag);
			const parentTag = tag.parentTag;
			const index = parentTag.children.findIndex(t => t.tagId === tag.tagId);			
			parentTag.children.splice(index,0, cloneTag);
		},
		clickDeleteTag(tag) {
			var parentTag = tag.parentTag;
			var index = parentTag.children.findIndex(t => t.tagId === tag.tagId);			
			parentTag.children.splice(index,1);

			let currentTag = null;
			if (index == parentTag.children.length) {
				currentTag = parentTag;
			} else {
				currentTag = parentTag.children[index];
			}
			this.emit(this.EVENTS.__EVENT__TAG__CURRENT_TAG__, {tag:currentTag});
		},
  	},

	mounted() {
		const self = this;
		self.tag = self.rootTag;

		self.on(self.EVENTS.__EVENT__TAG__CURRENT_TAG__, function(data) {
			const tag = data.tag;
			self.tag = tag;

			setTimeout(function() {
				self.$refs.tree.setCurrentKey(tag.tagId);
			}, 100);
		});
	},
}
</script>

<style scoped>
</style>
