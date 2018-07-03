<template>
	<div class="headerContainer">
		<div class="container full-height flex-col">
			<div class="flex-row">
				<user-link></user-link>
			</div>
		</div>
	</div>
</template>

<script>

import UserLink from  "@/components/bases/userLink.vue";
export default {
	components: {
		UserLink,
	},

	data: function() {
		return {
		}
	},

	methods: {
	},

	mounted() {
	}
}
</script>

<style scoped>
.headerContainer {
	background-color: rgb(248,248,248);
	height:100%;
}
.flex-col {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.flex-row {
	display: flex;
	justify-content: flex-end;
	padding-right: 10px;
}
</style>
