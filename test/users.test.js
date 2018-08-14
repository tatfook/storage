
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/users", () => {
	before(async (done) => {
		await app.model.users.truncate();

		done();
	});

	it("/users/register|login", async (done)=> {
		let user = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);

		assert.ok(user.token);
		assert.equal(user.id, 1);

		user = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);

		assert.ok(user.token);

		done();
	});

	it("PUT|GET /users/1", async (done)=> {
		const url = "/users/1";
		const ok = await app.httpRequest().put(url).send({
			sex:"M",
		}).expect(200);

		let user = await app.httpRequest().get(url).expect(200).then(res => res.body);

		assert.equal(user.sex, "M");

		done();
	});

	it ("/users/changepwd", async (done)=> {
		let data = await app.httpRequest().put("/users/pwd").send({
			oldpassword:"wuxiangan",
			password:"123456",
		}).expect(200);

		data = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"123456",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);

		done();
	});
});
