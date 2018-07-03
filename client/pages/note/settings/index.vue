<template>
	<div></div>
</template>

<script>

export default {

	data: function() {
		return {
		}
	},

	computed: {
	},

	mounted() {
		this.$router.replace(({name: g_app.getRouteName("settings-user-profile")}))
	}

}
</script>
