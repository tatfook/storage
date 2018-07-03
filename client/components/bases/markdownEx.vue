<template>
	<tag :tag="rootTag" class="markdown-body"></tag>
</template>

<script>
import tag from "@/components/common/tag.js";
import {tags} from "@/lib/tags";
import {markdownEx} from "@/lib/markdown";

export default {	
	name:"markdownEx",
	components:{
		tag,
	},

	data: function() {
		const roottag = tags.getTag();
		roottag.classes["container"] = true;
		return {
			rootTag: roottag,
			md: markdownEx(),
		};
	},

	props: {
		id: {
			type:String,
		},
		text: {
			type:String,
		},
		template: {
			type: Boolean,
			default: false,
		}
	},

	watch: {
		text: function(val) {
			this.parseText(val);
		},
	},

	methods: {
		getTagByBlock(block) {
			const md = this.md;
			const tag = tags.getTag(block.cmdName || "html");
			if (block.isMod) {
				tag.setVarsByKey(block.modParams);
			} else {
				//console.log(block.cmdName, tag, block);
				tag.vars.text = md.render(block.text);
			}

			return tag;
		},
		getMainTag() {
			return this.rootTag.getTagByKey("__main__") || this.rootTag;
		},
		parseText(text) {
			const self = this;
			const md = self.md;
			var subtag = undefined, tmpTag = undefined;
			var blocklist = md.parse(text);
			//console.log(md.template, text);
			if (this.template && md.template.isChange) {
				self.rootTag = self.getTagByBlock(md.template);
				//console.log(self.rootTag);
			}
			var tag = self.getMainTag();
			if (this.mainTagId != tag.tagId) {
				this.blocklist = [];
				this.mainTagId = tag.tagId;
			}
			//console.log(tag);
			for (var i = 0; i < blocklist.length; i++) {
				var block = blocklist[i];
				var oldblock = this.blocklist[i];
				
				if (block.isTemplate) {
					tag.setChildrenTag(i, tags.getTag());
				} else if (!oldblock || oldblock.isMod != block.isMod) {
					this.blocklist[i] = _.cloneDeep(block);
					subtag = this.getTagByBlock(block);
					subtag && tag.setChildrenTag(i, subtag);
					this.blocklist[i].tag = subtag;
				} else if (oldblock.isMod) {
					//console.log(oldblock);
					if (oldblock.modName == block.modName && tag.children[i].tagName == block.modName) {
						// 更新数据
						tag.children[i].setVarsByKey(block.modParams);
					} else {
						// 重新构造tag
						subtag = this.getTagByBlock(block);
						subtag && tag.setChildrenTag(i, subtag);
					}
				} else {
					tag.children[i].vars = tag.children[i].vars || {};
					tag.children[i].vars.text = self.md.render(block.text);
				}
			}
			var size = this.blocklist.length;
			for (var i = blocklist.length; i < size; i++) {
				this.blocklist.pop();
				tag.children.pop();
			}
			
			//console.log(tag.children, this.blocklist, blocklist, text);
		},
	},

	created() {
		this.blocklist = [];
	},

	mounted(){
		const self = this;
		this.text && this.parseText(this.text);

		self.on(self.EVENTS.__EVENT__MARKDOWN_EX__IN__TEXT__, function(data) {
			data = data || {};
			if (self.namespace != data.namespace) return;

			self.parseText(data.text || "");
		});
	},

}

</script>

<style scoped>
@import 'github-markdown-css/github-markdown.css';
</style>
