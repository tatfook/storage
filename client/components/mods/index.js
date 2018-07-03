import vue from "vue";
//import yaml from "js-yaml";
import _ from "lodash";

import {tags} from "@/lib/tags";
import template from "./template";
import title from "./title";
import tagmodstr from "./mods.yml";

//export const tagMods = yaml.load(tagmodstr);
export const tagMods = {};

const getTagFactoryByTag = (tag) => () => tags.getTagByTag(tag);
_.each(tagMods, mod => {
	_.each(mod.styles, style => {
		var cmdName = style.modName + '-' + style.styleName;
		tags.registerTagFactory(cmdName, getTagFactoryByTag(style.tag));
	});
})

export const mods = {
	template,
	title,
}

const getTagFactoryByVNode = (vnode) => () => tags.getTagByVNode(vnode);
//if (process.client) {
export const registerModTag = (store) => {
	for (var modName in mods) {
		var styles = mods[modName];
		for (var key in styles) {
			let style = styles[key];
			let tagKey = modName + "-" + (style.name || key);
			let comp = new vue({
				...style,
				store,
			});
			let vnode = comp.$mount()._vnode;

			////console.log(tagKey);
			////console.log(vnode);

			tags.registerTagFactory(tagKey, getTagFactoryByVNode(vnode));

		}
	}
}
//}

export default mods;
