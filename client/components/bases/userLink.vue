<template>
	<div>
		<div v-show="user.id">
			<el-dropdown @command="handleCommand" trigger="click">
				<el-button round size="small" type="text" class="el-dropdown-link" style="cursor:pointer">
					{{user.nickname || user.username || "逍遥"}}
					<i class="el-icon-arrow-down el-icon--right"></i>
				</el-button>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item command="user-profile">我的主页</el-dropdown-item>
					<el-dropdown-item command="settings">设置</el-dropdown-item>
					<el-dropdown-item command="editor">编辑器</el-dropdown-item>
					<el-dropdown-item command="tagModEditor">模块编辑器</el-dropdown-item>
					<el-dropdown-item divided command="logout">退出</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
		<div v-show="!user.id">
			<el-button type="text" @click="clickLoginBtn">登陆</el-button>
			<el-button type="text" @click="clickRegisterBtn">注册</el-button>
		</div>
	</div>
</template>

<script>
import {
	Button, 
	Dropdown, 
	DropdownMenu, 
	DropdownItem
} from "element-ui";

export default {
	components: {
		[Button.name]: Button,
		[Dropdown.name]: Dropdown,
		[DropdownMenu.name]: DropdownMenu,
		[DropdownItem.name]: DropdownItem,
	},

	data: function() {
		return {
		}
	},

	methods: {
		handleCommand(cmd){
			if (cmd == "logout") {
				this.logout();
				this.pushName("login");
				this.api.users.logout();
				return;
			}
			
			if (cmd == "user-profile") {
				this.$router.push({path:"/" + this.user.username});
				return ;
			}

			this.pushName(cmd);
		},
		clickLoginBtn() {
			this.pushName("login");
		},
		clickRegisterBtn() {
			this.pushName("register");
		},
	},

	mounted() {
	}
}
</script>

<style scoped>
</style>
