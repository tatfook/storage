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
    return this.generateDefaultWorld('你好啊');
  }

  async generateDefaultWorld(worldName) {
    let userInfo = this.authenticated()

    if (!userInfo || !userInfo.username) {
      return false
    }

    let tree = await this.app.git.getTree()
    let baseWorldName = this.base32(worldName)

    await new Promise((resolve, reject) => {
      let index = 0;

      if (!tree || tree.length == 0) {
        resolve()
      }

      _.forEach(tree, async (item, key) => {
        if (item && item.path) {

          let content = await this.app.git.getContent(null, item.path);

          item.content = content;
          index++

          if (index == tree.length) {
            resolve()
          }
        }
      })
    })

    let result = await this.app.git.createProject(userInfo.username, baseWorldName)
    
    // if (!result) {
    //   return this.ctx.throw(500);
    // }

    let worldProject = (userInfo.username || '') + '/' + (worldName || '')
  
    _.forEach(tree, (item, key) => {
      if (item && item.path && item.content) {
        if (item.path == 'tag.xml') {
          item.content = item.content.replace('name="DefaultName"', `name="${worldName || ''}"`)
        }

        this.app.git.writeFile(worldProject, item.path, item.content)
      }
    })

    console.log(this.ctx.state.token)
    console.log(this.ctx)
    // console.log(tree);
    // return this.ctx.throw(500);
  }

  // =转成-equal  +转成-plus  /转成-slash
  base32(text) {
    if (text) {
      let notLetter = text.match(/[^a-zA-Z]/g);

      if (notLetter) {
        text = base32.encode(text);

        text = text.replace(/[=]/g, '-equal');
        text = text.replace(/[+]/g, '-plus');
        text = text.replace(/[/]/g, '-slash');

        text = 'world_base32_' + text;
      } else {
        text = 'world_' + text;
      }

      return text;
    } else {
      return nil;
    }
  }

  unbase32(text) {
    if (text) {
      let notLetter = text.match('world_base32_');

      if (notLetter) {
        text = text.replace('world_base32_', '');

        text = text.replace(/-equal/g, '=');
        text = text.replace(/-plus/g, '+');
        text = text.replace(/-slash/g, '/');

        return Encoding.from_base32(text);
      } else {
        text = text.replace('world_', '');

        return text;
      }
    } else {
      return nil;
    }
  }
};

module.exports = World;
