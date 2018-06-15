
import {
	QINIU_AUDIT_STATE_NO_AUDIT,
	QINIU_AUDIT_STATE_PASS,
	QINIU_AUDIT_STATE_NOPASS,
	QINIU_AUDIT_STATE_FAILED,
} from "@/common/consts.js";
import qiniu from "@/models/qiniu.js";

test("qiniu", async () => {
	const key = "5addf570-64a4-11e8-8e76-35d8b025ee0a.png";
	const result = await qiniu.imageAudit(key);
	expect(result == QINIU_AUDIT_STATE_PASS).toBeTruthy();
}, 30000);
