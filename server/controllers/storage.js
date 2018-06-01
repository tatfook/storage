import sequelize from "@/models/database.js";
import storageModel from "@/models/storage.js";
import qiniu from "@/models/qiniu.js";

const storage = qiniu;

storage.updateStatistics = async function(username) {
	let result = await sequelize.query("SELECT SUM(size) AS `used`, COUNT(*) as `count` from `files` where `username` = :username",  {type: sequelize.QueryTypes.SELECT, replacements: {
		username: username,
	}});

	let data = result[0] || {};
	
	result = await storageModel.upsert({
		username: username,
		used: data.used || 0,
		fileCount: data.count || 0,
	});

	return result;
}

storage.getStatistics = async function(username) {
	let data = await storageModel.findOne({
		where:{
			username:username
		}
	});

	if (!data) {
		data = await storageModel.create({
			username: username
		});
	}

	data = data.get({plain: true});

	data.count = data.fileCount;

	return data;
}

storage.isFull = async function(username) {
	let data = await this.getStatistics(username);

	if (data.used < data.total) {
		return false;
	}

	return true;
}

export default storage;
