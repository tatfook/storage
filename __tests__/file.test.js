import * as qiniu from "qiniu-js";
import Context from "./mockContext.js";
import Files from "@/controllers/files.js";
import util from "@/common/util.js";

const qiniuUpload = async (key, file, token, params = {}, observer = {}) => {
	let data = null;

	const opts =  {
		token: token,
		putExtra: {
			mimeType: null,
			params: {
				"x:type": util.getTypeByPath(key),
			},
		},
		config: {
			useCdnDomain: true,
		},
	}

	//console.log(file);

	const observable = qiniu.upload(file, key, opts.token, opts.putExtra, opts.config);

	const ok = await new Promise((resolve, reject) => {
		observable.subscribe({
			next(res) {
				observer.next && observer.next(res);
				console.log(res);
			},
			error(err) {
				observer.error && observer.error(err);
				console.log(err);
				resolve(false);
				console.log(err);
			},
			complete(res){
				observer.complete && observer.complete(res);
				resolve(true);
				console.log(res);
			}
		});
	})

	return ok;
}

test("files", async () => {
	const files = new Files();
	const ctx = new Context();

	const key = "test_images/test.jpg";

	ctx.params.id = encodeURIComponent(key);

	let result = files.token(ctx);
	expect(result.isOk()).toBeTruthy();
	let data = result.getData();
	expect(data).toHaveProperty("token");

	//console.log("get token success");

	const token = data.token;

	//var file = new File(["First Line Text","Second Line Text"],"test.txt");
	//const ok = await qiniuUpload(key, file, token);

	//expect(ok).toBeTruthy();
	//console.log("upload file success");

	ctx.state.params = {
		filename: "test.jpg",
		sitename: "test",
		public: true,
	}

	result = await files.upsert(ctx);
	expect(result.isOk()).toBeTruthy();
	//data = result.getData();
	//console.log(data);
	//console.log("upsert file success");

	result = await files.findOne(ctx);
	expect(result.isOk()).toBeTruthy();
	//data = result.getData();
	//console.log(data);
	//console.log("get file success");

	result = await files.delete(ctx);
	//console.log(result);
	expect(result.isOk()).toBeTruthy();
	//data = result.getData();
	//console.log(data);
	//console.log("get file success");
}, 10000);


