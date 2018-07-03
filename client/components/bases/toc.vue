
<template>
	<div>
		<div v-for="(header, index) in headers" :key="index" v-if="isShow(header)" class="headerContainer" :class="classes(header, index)">
			<a @click="clickHeaderBtn(header, index)" :href='"#" + header.text'>{{header.text}}</a>
		</div>
	</div>
</template>

<script>
import _ from "lodash";
import md from "@/lib/markdown";

export default {
	//mixins: [component],

	data: function() {
		return {
			headers:[],
			index:null, // 当前激活项
			vars: {
				text: null,
				list: null,
			},
		}
	},

	props: {
		text: {
			type:String,
			default: "",
		},
		startLevel: {
			type: Number,
			default: 1,
		},
		endLevel: {
			type: Number,
			default: 6,
		},
		list: {
			type: Array,
			default: function() {
				return [
					{
						text:"标题",
						level:2,
					},
					{
						text:"子标题",
						level:3,
					},
				];
			}
		},
	},

	methods: {
		headersFunc() {
			const text = this.vars.text || this.text;
			if (!text) {
				this.headers = this.vars.list || this.list;
				return ;
			} 

			const tokens = md.md.parse(text);
			const headers = tokens.filter(token => /^[hH][1-6]$/.test(token.tag));
			//console.log(tokens, headers);;
			const navlist = [];
			_.each(headers, header => {
				navlist.push({
					level: _.toNumber(header.tag.substring(1)),
					text: header.content,
				});
			})
			//console.log(navlist);
			this.headers = navlist;
			return ;
		},

		isShow(header) {
			const level = header.level;
			const startLevel = this.vars.startLevel || this.startLevel;
			const endLevel = this.vars.endLevel || this.endLevel;
			if (startLevel <= level && level <= endLevel) {
				return true;
			}
			return false;
		},
		classes(header, index) {
			return "h" + header.level + (this.index == index ? " active" : "");
		},
		clickHeaderBtn(header, index) {
			this.index = index
		},
	},

	mounted() {
		const self = this;
		self.headersFunc();

		self.on(self.EVENTS.__EVENT__TOC__IN__, function(data) {
			_.merge(self.vars, data);
			self.headersFunc();
		});

		self.on(self.EVENTS.__EVENT__TOC__IN__TEXT__, function(text) {
			self.vars.text = text;
			self.headersFunc();
		});
	},

	created() {
	},
}

</script>

<style scoped>
.headerContainer {
	font-size:14px;
}
.headerContainer a {
	text-decoration:none;
}
.headerContainer.active {
	background-color:gray;
}
.h1 {
	padding-left:4px;
	font-size:20px;
}
.h2 {
	padding-left:24px;
	font-size:18px;
}
.h3 {
	padding-left:44px;
	font-size:16px;
}
.h4 {
	padding-left:64px;
}
.h5 {
	padding-left:84px;
}
.h6 {
	padding-left:104px;
}
</style>
