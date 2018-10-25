const joi = require('joi');
const _ = require('lodash');
const base32 = require('base32');

const Controller = require('../core/controller.js');
const {
  ENTITY_TYPE_USER,
  ENTITY_TYPE_SITE,
  ENTITY_TYPE_PAGE
} = require('../core/consts.js');

const World = class extends Controller {
  get modelName() {
    return 'worlds';
  }

  async test() {
    const ok = await this.ctx.service.world.generateDefaultWorld('你好啊6');
	return this.success(ok);
  }
};

module.exports = World;
