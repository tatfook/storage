<template>
	<div>
		<markdownEx :text="content"></markdownEx>
	</div>
</template>

<script>
import {
	Message,
} from "element-ui";

import config from "@/config.js";
import api from "@@/common/api/note.js";
import util from "@@/common/util.js";

import markdownEx from "../../components/bases/markdownEx.vue";

export default {
	components: {
		markdownEx,
	},

	data: function() {
		return {
			key: null,
			content: "",
		}
	},

	async asyncData({req}) {
		api.options.baseURL = config.origin + config.baseUrl;		
	
		const path = req.ctx.request.path;
		const key = util.getKeyByPath(path.substring(1) + config.pageSuffix);
		const result = await api.pages.getByKey({key:key});
		if (!result || result.isErr()) {
			console.log(result);
			return;
		}

		const content = result.getData().content;
		return {
			content: content,
			key: key,
		};
	},

	methods: {
		async visitPage() {
			await this.api.pages.visitByKey({key: this.key});
		}

	},

	created() {
		//console.log(this.content);
	},

	async mounted() {
		//const url = this.$route.path;
		//const path = url.substring(1) + config.pageSuffix;
		//const key = util.getKeyByPath(path);
		//const result = await api.pages.get({key:key});
		//if (!result || result.isErr()) {
			////Message(result.getMessage());
			//console.log(result);
			//return;
		//}

		//this.key = key;
		//this.content = result.getData().content;

		this.visitPage();
	}
}
</script>
