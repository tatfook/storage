<template>
	<div>
		<!--<Board></Board>-->
	</div>
</template>

<script>
import Board from "@/components/bases/board.vue";

class Base {

	static print() {
		console.log(this.name);
	}
}

export default {
	layout: "index",

	data: function() {
		return {
		}
	},

	components: {
		Board,
	},

	computed: {
	},

	methods: {
	},

	mounted() {
		console.log(Base.print())
		window.base = new Base();
		console.log(base)
	}
}
</script>
