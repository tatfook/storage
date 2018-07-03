
<template>
	<div v-text="propValue('text')"></div>
</template>

<script>
export default {
	props: {
		text: {
			type:String,
			default:"",
		}
	}
}
</script>
