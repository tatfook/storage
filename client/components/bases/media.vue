<template>
	<div class="mediaContainer">
		<img class="image" :src="src" v-if="isImage"/>
		<video class="video" :src="src" v-else-if="isVedio"></video>
		<audio class="audio" :src="src" v-else-if="isAudio"></audio>
		<div v-else></div>
	</div>
</template>

<script>
import _ from "lodash";

export default {
	props: {
		src: {
			type: String,
			default: "http://git.keepwork.com/gitlab_rls_lixizhi/keepworkdatasource/raw/master/lixizhi_images/img_1520938234618.jpeg",
		},
		type: {
			type: String,
		},
	},

	computed: {
		isImage() {
			if (this.type) return this.type ;

			const src = this.src;
			const types = [".jpg", ".jpeg", ".png", ".svg"];

			if (!src) return false;

			if (types.findIndex(el => _.endsWith(src.toLowerCase(), el)) !== -1) return true;

			let type = src.split(',')[0] ? src.split(',')[0] : ''
			if (type === 'data:image/png;base64' || type === 'data:image/jpeg;base64' || type === 'data:image/gif;base64') {
				return true;
			}
			return false;
		},
		isVedio() {
			if (this.type) return this.type ;

			const src = this.src;
			const types = [".mp4", ".webm"];

			if (!src) return false;
			
			return types.findIndex(el => _.endsWith(src.toLowerCase(), el)) !== -1;
		},
		isAudio() {
			if (this.type) return this.type ;

			const src = this.src;
			const types = [".mp3", ".ogg", ".wav"];
			
			if (!src) return false;

			return types.findIndex(el => _.endsWith(src.toLowerCase(), el)) !== -1;
		},
	}

}
</script>

<style scoped>
.mediaContainer>.image {
	height: 100%;
	width: 100%;
}

.mediaContainer>.video {

}
.mediaContainer>.audio {

}
</style>
