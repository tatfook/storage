<template>
	<div style="display:flex" class="container">
		<div style="width:20%">
			<userpage key="leftSideBar"></userpage>
		</div>
		<div key="__main__" style="width:80%">
		</div>
	</div>
</template>

<script>
import userpage from "@/components/bases/userpage.vue";

export default {
	components: {
		userpage,
	},
}
</script>
