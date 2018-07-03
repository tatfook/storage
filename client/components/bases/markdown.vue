
<template>
	<div class="markdownContainer markdown-body">
		<div v-html="html"></div>
	</div>
</template>

<script>

import md from "@/lib/markdown/index.js";

export default {
	data: function() {
		return {
			vars: {
				text: "",
			}
		}
	},

	props: {
		text: {
			type: String,
			default: "Markdownn Text"
		}
	},

	computed: {
		html() {
			return md.render(this.text); 
		},
	}
}
</script>

<style scoped>
@import 'github-markdown-css/github-markdown.css';
</style>
