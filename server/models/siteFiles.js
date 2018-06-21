import Sequelize from "sequelize";
import sequelize from "./database.js";

const SiteFiles = sequelize.define("siteFiles", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	fileId: {       // 文件ID
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	userId: {  // 文件使用位置的的用户名
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	siteId: {  // 文件使用位置的站点名
		type: Sequelize.BIGINT,
		allowNull: false,
	},

}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["fileId", "userId", "siteId"],
	},
	],
});

//SiteFiles.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});

export default SiteFiles;
