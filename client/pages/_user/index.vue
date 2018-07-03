<template>
	<el-row>
		<el-col :span="6">
			<img :src="userinfo.portrait">
			<h3>{{userinfo.nickname}}</h3>
			<h5>{{userinfo.username}}</h5>
			<p>{{userinfo.description}}</p>
			<el-button @click="clickFollowingBtn">{{isFollowing ? "取消关注" : "关注"}}</el-button>
		</el-col>
		<el-col :span="18">
			<el-tabs v-model="activeItem" @tab-click="clickActiveItemBtn">
				<el-tab-pane label="概述" name="overview">概述</el-tab-pane>
				<el-tab-pane label="站点" name="site">
					<div v-for="(x, index) in sites" :key="index">
						<h4>{{x.sitename}}</h4>
						<p>{{x.description}}</p>
					</div>
				</el-tab-pane>
				<el-tab-pane label="收藏" name="favorite">
				</el-tab-pane>
				<el-tab-pane label="粉丝" name="follows">
					<div v-for="(x, index) in follows" :key="index">
						<h4>{{x.nickname}}</h4>
						<h5>{{x.username}}</h5>
						<p>{{x.description}}</p>
					</div>
				</el-tab-pane>
				<el-tab-pane label="关注" name="following">
					<div v-for="(x, index) in following">
						<h4>{{x.nickname}}</h4>
						<h5>{{x.username}}</h5>
						<p>{{x.description}}</p>
					</div>
				</el-tab-pane>
			</el-tabs>
		</el-col>
	</el-row>
</template>

<script>
import axios from "axios";
import {
	Tabs,
	TabPane,
} from "element-ui";

export default {
	components: {
		[Tabs.name]: Tabs,
		[TabPane.name]: TabPane,
	},

	data: function() {
		return {
			activeItem: "overview",
			userinfo: {},
			isFollowing: false,
			sites: [],
			favoriteSites: [],
			favoritePages: [],
			follows: [],
			following: [],
			itemMap: {},
		}
	},

	methods: {
		clickActiveItemBtn() {
			if (this.itemMap[this.activeItem]) return;
			this.itemMap[this.activeItem] = true;

			if (this.activeItem == "site") {
				this.getSites();
			}
			
			if (this.activeItem == "favorite") {
				this.getFavorites();
				
			}

			if (this.activeItem == "follows") {
				this.getFollows();
			}
			
			if (this.activeItem == "following") {
				this.getFollowing();
			}
		},

		async getSites() {
			let sites = await this.api.sites.search({userId: this.userinfo.id});

			if (sites.isErr()) return;

			this.sites = sites.getData();
		},

		async getFavorites() {
			const userId = this.userinfo.id;
			let favoriteSites = await this.api.favorites.getFavoriteSites({userId});
			this.favoriteSites = favoriteSites.getData() || [];

			//let favoritePages = await this.api.favorites.getFavoritePages({userId});
			//this.favoritePages = favoritePages.getData() || [];
		},

		async getFollows() {
			const userId = this.userinfo.id;
			let follows = await this.api.favorites.getFollows({userId});
			this.follows = follows.getData() || [];
		},

		async getFollowing() {
			const userId = this.userinfo.id;
			let following = await this.api.favorites.getFollowing({userId});
			this.following = following.getData() || [];
		},

		async clickFollowingBtn() {
			const favoriteId = this.userinfo.id;
			const methodName = this.isFollowing ? "unFollowing" : "following";
			if (!favoriteId) return;

			const result = await (this.api.favorites[methodName])({favoriteId});
			this.isFollowing = !this.isFollowing;
		}
	},

	async mounted() {
		axios.get("http://localhost:3000/api/v0/users/2");
		// 获取访问用户信息
		const username = this.$route.params.user;
		let result = await this.api.users.getDetailByUsername({username});
		if (result.isErr()) {
			this.pushName("notfound");
			return;
		}
		this.userinfo = result.getData();

		// 是否关注
		result = await this.api.favorites.isFollowing({favoriteId:this.userinfo.id});
		this.isFollowing = result.getData();
	}
}
</script>
