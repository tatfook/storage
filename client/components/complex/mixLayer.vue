
<template>
	<div class="mixLayerContainer">
		<Media class="media"></Media>
		<Markdown class="markdown"></Markdown>
	</div>
</template>
<script>
import Media from "@/components/bases/media.vue";
import Markdown from "@/components/bases/markdown.vue";


export default {
	components: {
		Media,
		Markdown,
	},
}
</script>


<style scoped>
.mixLayerContainer {
	position: relative;
}

.mixLayerContainer .media {

}

.mixLayerContainer .markdown {
	position: absolute;
	top: 20px;
	color: white;
}
</style>
