import sequelize from "@/models/database.js";
import storageModel from "@/models/storage.js";
import qiniu from "@/models/qiniu.js";

const storage = qiniu;

storage.updateStatistics = async function(userId) {
	let result = await sequelize.query("SELECT SUM(size) AS `used`, COUNT(*) as `fileCount` from `files` where `userId` = :userId and size > 0",  {type: sequelize.QueryTypes.SELECT, replacements: {
		userId: userId,
	}});

	if (!result || !result[0]) return;
	const data = result[0];

	await storageModel.update({
		userId,
		used: data.used,
		fileCount: data.fileCount,
	}, {where:{userId}});

	return;
}

storage.getStatistics = async function(userId) {
	await this.updateStatistics(userId);
	let data = await storageModel.findOne({where:{userId:userId}});

	if (!data) {
		data = {
			userId,
			total: 2 * 1024 * 1024 * 1024,
			used: 0,
			fileCount: 0,
		}
		await storageModel.create(data);
	} 

	return data;
}

storage.isFull = async function(userId) {
	let data = await this.getStatistics(userId);

	if (data.used < data.total) {
		return false;
	}

	return true;
}

export default storage;
