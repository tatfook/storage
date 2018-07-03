<template>
	<div style="display:flex; height:100%; flex-direction:column;">
		<div style="height:60px;">
			<Header></Header>
		</div>
		<div style="flex:1">
			<nuxt></nuxt>
		</div>
		<div>
			<Footer></Footer>
		</div>
	</div>
</template>

<script>
import _Header from "@/components/mods/common/header.vue";
import _Footer from "@/components/mods/common/footer.vue";
export default {
	components: {
		Header:_Header,
		Footer:_Footer,
	}
}
</script>

<style>
.el-container, .el-main {
	height:100%;
}
.el-container>.el-header,.el-main,.el-footer{
	padding:0px;
}
</style>
