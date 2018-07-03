import _ from "lodash";

import commonConfigs from "@@/common/config.js";
const ENV = process.env.ENV || process.env.NODE_ENV;

const commonConfig = commonConfigs[ENV];

const defaultConfig = {
	tagModsPath: "note/note/mods.md",
}

const productionConfig = {
}

const developmentConfig = {
}

const localConfig = {

}

const configs = {
	"production": _.merge({}, commonConfig, defaultConfig, productionConfig),
	"development": _.merge({}, commonConfig, defaultConfig, developmentConfig),
	"local": _.merge({}, commonConfig, defaultConfig, localConfig),
}

console.log(ENV);

export default configs[ENV];

