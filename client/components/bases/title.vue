<template>
	<div  class="titleContainer">
		{{text}}
	</div>
</template>


<script>

export default {

	data: function() {
		return {

		}
	},

	props: {
		text: {
			String,
		}
	},
}
</script>

<style scoped>
.titleContainer {
	font-weight: bold;
	font-size: 16px;
}
</style>
