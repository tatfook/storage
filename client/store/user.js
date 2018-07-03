import vue from "vue";
import jwt from "jwt-simple";

const SET_USER = 'SET_USER';

export const state = () => ({
	user: {},
})

export const getters = {
	isAuthenticated: (state) => {
		if (!state.user || !state.user.token) return false;
		const payload = jwt.decode(state.user.token, null, true);
		//console.log(payload);

		if (payload.nbf && Date.now() < payload.nbf*1000) {
			return false;
		}
		if (payload.exp && Date.now() > payload.exp*1000) {
			return false;
		}

		return true;
	},
	user: (state) => (state.user || {}),
}

export const actions = {
	setUser({commit}, user){
		commit(SET_USER, user);
	},
}

export const mutations = {
	[SET_USER](state, user) {
		vue.set(state, "user", user);
	},
}

//export default {
	//namespaced: true,
	//state, 
	//getters,
	//actions,
	//mutations,
//}
