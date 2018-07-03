import shell from "shelljs";
const path = require("path");

const rootdir = path.resolve();
export const Code = function() {
	this.rootdir = rootdir;
}


Code.prototype.pushCode = function() {
	var cmd_str = "cd " + this.rootdir + "; git reset --hard HEAD; git pull origin master;";
	//cmd_str += "wget 'http://qiniu.wxaxiaoyao.cn/note/note/mods.md?attname=&e=1525602488&token=qPCxQ1ZsJnhESNNftGWh5oTaDesVgzM_O4O0h8Wg:axONBqLmRwx3Fh9NN84BwzHvG2E' -O ./client/components/mods/mods.yml";
	shell.exec(cmd_str);
}

Code.getRoutes = function() {
	const self = this;
	self.pathPrefix = "code";
	const routes = [
	{
		path: "push_code",
		method: "all",
		action: "pushCode",
	},

	];

	return routes;
}

export default Code;
