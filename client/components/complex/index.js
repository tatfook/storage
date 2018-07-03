import vue from "vue";

import common from "@/components/bases/common.js";
import MixLayer from "./mixLayer.vue";

const components = {
	MixLayer,
}

for (var key in components) {
	var component = components[key];
	vue.component(key, {
		mixins:[common, component],
	});
}
