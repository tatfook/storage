
const keepwork = {

}

const component = {

}

const keepworkPlugin = {
	install(Vue, options) {
		Vue.mixin(component);
		Vue.prototype.$keepwork = keepwork;
	}
}
