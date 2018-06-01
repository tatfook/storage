
const mockContext = function() {
	this.request = {
		state: {
		},
		body: {},
		query: {},
		params: {},
	};
	this.response = {};
	this.params = {};
	this.state = {
		user:{
			userId: 1,
			username: "test",
		}
	}
}

export default mockContext;
