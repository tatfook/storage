<template>
	<el-tabs class="left-el-tabs" type="border-card">
		<el-tab-pane label="文件">
			<filetree></filetree>
		</el-tab-pane>	
		<el-tab-pane label="模块">
			<!--<modTree></modTree>-->
		</el-tab-pane>
	</el-tabs>
</template>

<script>
import {
	Tabs,
	TabPane,
	Message,
} from "element-ui";
//import modTree from "./modTree.vue";
import tagTree from "./tagTree.vue";
import tagNav from "./tagNav.vue";
import tagEdit from "./tagEdit.vue";
import filetree from "./filetree.vue";

export default {
	components: {
		[Tabs.name]: Tabs,
		[TabPane.name]: TabPane,
		filetree,
		tagTree,
		tagNav,
		tagEdit,
	},
	methods: {
	},
}
</script>

<style>
.el-tabs, .el-tab-pane {
	height:100%;
	width: 100%;
	border: 0px;
}
.left-el-tabs .el-tabs__content {
	height:100%;
	padding:0px;
}
.left-el-tabs .el-tabs__header.is-left {
	margin-right:0px;
}
.left-el-tabs .el-tab-pane {
	overflow-y:auto;
}
.left-el-tabs .el-tab-pane::-webkit-scrollbar {
	display: none;
}
</style>
