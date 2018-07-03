import _ from "lodash";
import Sequelize from 'sequelize';
import sequelize from "./database.js";

import md5 from "blueimp-md5";

// 用户表定义
const users = sequelize.define('users', {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	username: {
		type: Sequelize.STRING(48),
		unique: true,
		allowNull: false,
	},

	password: {
		type: Sequelize.STRING(48),
		set(val) {
			this.setDataValue("password", md5(val));
		},
	},

	email: {
		type: Sequelize.STRING(24),
		unique: true,
	},

	cellphone: {
		type: Sequelize.STRING(24),
		unique: true,
	},

	nickname: {
		type: Sequelize.STRING(48),
	},

	portrait: {
		type: Sequelize.STRING,
	},

	sex: {
		type: Sequelize.STRING(4),
	},

	description: {
		type: Sequelize.STRING(128),
	},

}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});
//users.sync({force:true}).then(() => {
	//console.log("create user table successfully");
//});


const sites = sequelize.define('sites', {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	sitename: {
		type: Sequelize.STRING(48),
		allowNull: false,
	},

	visibility: {
		type: Sequelize.INTEGER, // public private
		defaultValue: 0,
	},

	description: {
		type: Sequelize.STRING(128),
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
	indexes: [
	{
		unique: true,
		fields: ["userId", "sitename"],
	},
	],
});
//sites.sync({force:true}).then(() => {
	//console.log("create site table successfully");
//});


// 站点域名
export const domains = sequelize.define("domains", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	domain: {
		type: Sequelize.STRING(32),
		unique: true,
		allowNull: false,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	siteId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});
//domains.sync({force:true}).then(() => {
	//console.log("create site table successfully");
//});

// 状态表
export const states = sequelize.define("states", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		unique: true,
		allowNull: false,
	},

	state: {
		type:Sequelize.INTEGER,
	},

	type: {
		type:Sequelize.INTEGER,
	},

	description: {
		type: Sequelize.STRING(128),
	},

	startDate: {
		type:Sequelize.INTEGER,
	},

	endDate: {
		type:Sequelize.INTEGER,
	},
	
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});
//states.sync({force:true}).then(() => {
	//console.log("create site table successfully");
//});


// 组定义
const groups = sequelize.define("groups", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	groupname: {
		type: Sequelize.STRING(48),
		allowNull: false,
	},

	description: {
		type: Sequelize.STRING(128),
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["userId", "groupname"],
	},
	],
});
//groups.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});

// 组成员表定义
const groupMembers = sequelize.define("groupMembers", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	groupId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	memberId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	level: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["groupId", "memberId"],
	},
	],
});
//groupMembers.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});

// 站点组定义
export const siteGroups = sequelize.define("siteGroups", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	siteId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	groupId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	level: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["siteId", "groupId"],
	},
	],
});
//siteGroupsModel.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


// 站点成员
const siteMembers = sequelize.define("siteMembers", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	siteId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	memberId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	level: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
	indexes: [
	{
		unique: true,
		fields: ["siteId", "memberId"],
	},
	],
});
//siteMembers.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


// 收藏表
export const favorites = sequelize.define("favorites", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	favoriteId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	type: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["userId", "favoriteId", "type"],
	},
	],
});
//favorites.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


// 页面表
export const pages = sequelize.define("pages", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	//userId: {
		//type: Sequelize.BIGINT,
		//allowNull: false,
	//},

	//siteId: {
		//type: Sequelize.BIGINT,
		////allowNull: false,
	//},

	key: {
		type: Sequelize.STRING(128),
		allowNull: false,
		unique: true,
	},

	folder: {
		type: Sequelize.STRING(128),
		allowNull: false,
	},
	
	hash: {
		type: Sequelize.STRING(64),
	},
	
	content: {
		type: Sequelize.TEXT,
		defaultValue: "",
	},

}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
});
	
//pages.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


export const visitors = sequelize.define("visitors", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
	},

	entityId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	type: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},

	count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},

	visitors: {
		type: Sequelize.TEXT,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',

	indexes: [
	{
		unique: true,
		fields: ["entityId", "type"],
	},
	],
});

//visitors.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


export const dataSources = sequelize.define("dataSources", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	name: {
		type: Sequelize.STRING(32),
		allowNull: false,
	},

	type: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},

	token: {
		type: Sequelize.STRING(64),
		allowNull: false,
	},
	
	projectId: {
		type: Sequelize.INTEGER,
	},
	
	host: {
		type: Sequelize.STRING(32),
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
	indexes: [
	{
		unique: true,
		fields: ["userId", "name"],
	},
	],
});
	
//dataSources.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


export const siteDataSources = sequelize.define("siteDataSources", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},

	userId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},
	
	siteId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},
		
	dataSourceId: {
		type: Sequelize.BIGINT,
		allowNull: false,
	},

	projectId: {
		type: Sequelize.INTEGER,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
	indexes: [
	{
		unique: true,
		fields: ["userId", "siteId"],
	},
	],
});
//siteDataSources.sync({force:true}).then(() => {
  //console.log("create files table successfully");
//});


export const files = sequelize.define("files", {
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

//files.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});


export const storages = sequelize.define("storages", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	userId: {  // 文件所属者
		type: Sequelize.BIGINT,
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

//storages.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});

export const oauthUsers = sequelize.define("oauthUsers", {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true,
	},
	
	userId: {  // 文件所属者
		type: Sequelize.BIGINT,
	},

	externalId: {
		type: Sequelize.STRING(48),
	},

	externalUsername: {
		type: Sequelize.STRING(48),
	},

	type: {
		type: Sequelize.INTEGER,
	},
}, {
	charset: "utf8mb4",
	collate: 'utf8mb4_bin',
	indexes: [
	{
		unique: true,
		fields: ["externalId", "type"],
	},
	],
});
//oauthUsers.sync({force:true}).then(() => {
	//console.log("create files table successfully");
//});


export default {
	users,
	sites,
	states,
	domains,
	groups,
	groupMembers,
	siteGroups,
	siteMembers,
	favorites,
	pages,
	visitors,
	dataSources, 
	siteDataSources,
	files,
	storages,
	oauthUsers,
};
