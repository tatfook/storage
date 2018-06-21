import sequelize from "@/models/database.js";
import storageModel from "@/models/storage.js";
import qiniu from "@/models/qiniu.js";

const storage = qiniu;

storage.updateStatistics = async function(userId) {
	let result = await sequelize.query("SELECT SUM(size) AS `used`, COUNT(*) as `count` from `files` where `userId` = :userId",  {type: sequelize.QueryTypes.SELECT, replacements: {
		userId: userId,
	}});

	let data = result[0] || {};
	
	result = await storageModel.upsert({
		userId: userId,
		used: data.used || 0,
		fileCount: data.count || 0,
	});

	return result;
}

storage.getStatistics = async function(userId) {
	let data = await storageModel.findOne({
		where:{
			userId:userId
		}
	});

	if (!data) {
		data = await storageModel.create({
			userId: userId
		});
	}

	data = data.get({plain: true});

	data.count = data.fileCount;

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
