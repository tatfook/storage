import Sequelize from "sequelize";
import sequelize from "./database.js";

const Files = sequelize.define("files", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	key: {  // 存储服务的文件名  推荐使用全路径  可以使用UUID 唯一即可
		type: Sequelize.STRING(256),
		unique: true,
	},

	folder: {
		type: Sequelize.STRING(256),
	},

	visibility: {   // 是否公开
		type: Sequelize.INTEGER,
	},

	type: {     // 文件类型
		type: Sequelize.STRING(12),
		defaultValue: "files",
	},

	size: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},

	hash: {     // 七牛哈希  文件存于谁就用谁的hash   如 git sha
		type: Sequelize.STRING(64),
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});

//Files.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});

export default Files;
