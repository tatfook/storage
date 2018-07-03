<template>
	<div>not found</div>
</template>

<script>

export default {
	async asyncData({req}) {
		const path = req.ctx.request.path;
		console.log(path);
	},
	created() {

	}
}
</script>
