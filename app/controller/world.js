const joi = require('joi');
const _ = require('lodash');

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
    return this.generateDefaultWorld();
  }

  async generateDefaultWorld() {
		

    console.log(this.app.git.getTree())

		// console.log(gitGatewayApi)
		// console.log(paracraftDefaultProject)

    // return this.ctx.throw(500);
  }
};

module.exports = World;
