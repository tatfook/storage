<template>
	<div class="defaultContainer">
		<div class="headerContainer">
			<Header></Header>
		</div>
		<div class="mainContainer">
			<nuxt/>
		</div>
	</div>
</template>

<script>
import _Header from "@/components/mods/common/header.vue";
export default {
	components: {
		Header:_Header,
	}
}
</script>

<style scoped>
.defaultContainer {
	height: 100%;
}

.headerContainer {
	height: 60px;
}

.mainContainer {
	position: absolute;
	left: 0px;
	right: 0px;
	top:60px;
	bottom: 0px;
}
</style>
