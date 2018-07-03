import _ from "lodash";

export default {
	data: function() {
		return {
		}
	},

	props: {
		tag: {
			type:Object,
		},
	},

	methods: {
		propValue(key) {
			if (this.tag && this.tag.vars && this.tag.vars[key]) {
				return this.tag.vars[key];
			}

			return this[key];
		}
	},

	watch: {
		"tag.vars": function(val) {
			this.vars = val;
		}
	},
	created(){
	}
}
