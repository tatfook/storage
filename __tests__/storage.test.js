
import storageModel from "@/models/storage.js";
import storage from "@/controllers/storage.js";

test("storage", async () => {
	const username = "test";
	let data = await storage.getStatistics(username);
	
	expect(data).toHaveProperty("total");
	
	data = await storageModel.upsert({...data, used:0, username});

	expect(await storage.isFull(username)).toBeFalsy();

	data = await storageModel.upsert({...data, used:2 * 1024 * 1024 * 1024, username});

	expect(await storage.isFull(username)).toBeTruthy();

	data = await storageModel.upsert({...data, used:0, username});

	expect(await storage.isFull(username)).toBeFalsy();
});
