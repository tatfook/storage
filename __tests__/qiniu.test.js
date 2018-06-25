
import {
	QINIU_AUDIT_STATE_NO_AUDIT,
	QINIU_AUDIT_STATE_PASS,
	QINIU_AUDIT_STATE_NOPASS,
	QINIU_AUDIT_STATE_FAILED,
} from "@/common/consts.js";
import Context from "./mockContext.js";
import Files from "@/controllers/files.js";
import qiniu from "@/models/qiniu.js";

test("qiniu", async () => {
	const files = new Files();
	const ctx = new Context();

	let key = "5addf570-64a4-11e8-8e76-35d8b025ee0a.png";
	//const result = await qiniu.imageAudit(key);
	//expect(result == QINIU_AUDIT_STATE_PASS).toBeTruthy();

	key = "test.txt";
	ctx.params.id = encodeURIComponent(key);

	let result = await files.token(ctx);
	expect(result.isOk()).toBeTruthy();
	const token = result.getData().token;

	qiniu.upload(key, "hello world", token);
}, 30000);



