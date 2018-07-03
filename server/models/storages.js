import Sequelize from "sequelize";
import sequelize from "./database.js";

const Storages = sequelize.define("storages", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	userId: {  // 文件所属者
		type: Sequelize.STRING(48),
		unique: true,
		allowNull: false,
	},

	total: {
		type: Sequelize.BIGINT,
		defaultValue: 2 * 1024 * 1024 * 1024,
	},

	used: {
		type: Sequelize.BIGINT,
		defaultValue: 0,
	},

}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});

//Storages.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});

export default Storages;
