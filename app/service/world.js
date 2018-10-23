const _ = require('lodash');
const base32 = require('base32');
const Service = require('egg').Service;

class World extends Service {
	getArchiveUrl(username, worldName) {
		const config = this.app.config.self.gitlab;
		const host = config.host;
		const baseWorldName = this.base32(worldName);
		const gitUsername = config.usernamePrefix + username;
		
		return `${host}/${gitUsername}/${baseWorldName}/repository/archive.zip`;
	}

  async generateDefaultWorld(worldName) {
    let userInfo = this.ctx.state.user;
    if (!userInfo || !userInfo.username) {
      return false
    }

    let tree = await this.app.git.getTree()
    let baseWorldName = this.base32(worldName)
    let worldProject = (userInfo.username || '') + '/' + (baseWorldName || '')

    let result = await this.app.git.isProjectExist(worldProject)

    if (!result) {
      let result = await this.app.git.createProject(userInfo.username, baseWorldName)

      if (!result) {
        return this.ctx.throw(500);
      }
    }

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

    let token = this.ctx.state.token
    let writeList = []

    _.forEach(tree, (item, key) => {
      if (item && item.path && item.content) {
        if (item.path == 'tag.xml') {
          item.content = item.content.replace('name="DefaultName"', `name="${worldName || ''}"`)
        }

        writeList[writeList.length] = this.app.git.writeFile(token, worldProject, item.path, item.content)
      }
    })

    try {
      const ok = await Promise.all(writeList)
      const archiveUrl = this.getArchiveUrl(userInfo.username, worldName);
	  return {archiveUrl};
    } catch (error) {
		console.log(error);
      return this.ctx.throw(409)
    }
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

}

module.exports = World;

