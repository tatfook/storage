const axios = require("axios");

class GitGateway {
  constructor(config, app) {
    this.config = config;
    this.app = app;
    this.isConfigRight = true;
    this.cacheTree = [];
    this.cacheContent = {};

    if (
      !this.app ||
      !this.app.config ||
      !this.app.config.self ||
      !this.app.config.self.secret ||
      !this.app.util ||
      !this.app.util.jwt_encode
    ) {
      this.isConfigRight = false;
    }

    this.gitGatewayApi = this.app.config.self.gitGatewayURL || '';
    this.paracraftDefaultProject =
      this.app.config.self.paracraftDefaultProject || '';

    if (!this.gitGatewayApi || !this.paracraftDefaultProject) {
      this.isConfigRight = false;
    }

    if (!this.app) {
      this.isConfigRight = false;
    }
  }

  async getAdminToken() {
    if (!this.isConfigRight) {
      return false;
    }

    if (!this.adminToken) {
      this.adminToken = this.app.util.jwt_encode({userId:1, roleId: 10}, this.app.config.self.secret, 3600 * 24 * 365 * 10)
    }

    return this.adminToken
  }

  async getUserGitlabTokenAndUsername(token) {
    if (!this.isConfigRight || typeof(token) != "string") {
      return false;
    }

    let url = `${this.gitGatewayApi}/accounts`;

    let axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${token || ''}`,
        "Content-Type": "application/json"
      }
    })

    try {
      let response = await axiosInst.get(url)

      if (response && response.data && response.data.token) {
        return { gitlabToken: response.data.token, gitlabUsername: response.data.git_username};
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async createProject(userName, worldName) {
    if (!this.isConfigRight || typeof userName != 'string' || typeof worldName != 'string') {
      return false;
    }

    let url = `${this.gitGatewayApi}/projects/user/${userName}`;
    let adminToken = await this.getAdminToken()

    let axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${adminToken || ''}`,
        "Content-Type": "application/json"
      }
    })

    try {
      let response = await axiosInst.post(url, {
        sitename: worldName,
        visibility: 'public'
      });

      if (response && response.data && response.data.created) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async removeProject() {
    if (!this.isConfigRight) {
      return false;
    }

    let adminToken = this.app.util.jwt_encode;
  }

  async getTree(projectPath) {
    if (!this.isConfigRight) {
      return [];
    }

    projectPath = projectPath || this.paracraftDefaultProject;

    if (projectPath == this.paracraftDefaultProject) {
      if (Array.isArray(this.cacheTree) && this.cacheTree.length > 0) {
        return this.cacheTree
      }
    }

    let url = `${this.gitGatewayApi}/projects/${encodeURIComponent(projectPath)}/tree/?recursive`;
    let response;

    try {
      response = await axios.get(url);
    } catch (error) {}

    if (response && response.data) {
      this.cacheTree = response.data;

      return response.data;
    } else {
      return [];
    }
  }

  async getContent(projectPath, path) {
    if (!this.isConfigRight || !path) {
      return '';
    }

    projectPath = projectPath || this.paracraftDefaultProject;

    let url = `${this.gitGatewayApi}/projects/${encodeURIComponent(projectPath)}/files/${encodeURIComponent(path)}`;

    if (projectPath == this.paracraftDefaultProject) {
      if (this.cacheContent[url]) {
        return this.cacheContent[url]
      }
    }

    let response;

    try {
      response = await axios.get(url);
    } catch (error) {}

    if (response && response.data && response.data.content) {
      this.cacheContent[url] = response.data.content;

      return response.data.content;
    } else {
      return '';
    }
  }

  async writeFile(token, projectPath, path, content) {
    if (!this.isConfigRight || !projectPath || !path) {
      return false;
    }

    if (projectPath == this.paracraftDefaultProject) {
      return false;
    }

    let url = `${this.gitGatewayApi}/projects/${encodeURIComponent(projectPath)}/files/${encodeURIComponent(path)}`;

    let axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${token || ''}`,
        "Content-Type": "application/json"
      }
    })

    let result = await axiosInst.post(url, {
      content: content
    })

    if (result && result.data && result.data.created) {
      return true
    } else {
      return false
    }
  }

  // deleteFile(projectPath, path) {
  //   if (!this.isConfigRight) {
  //     return false;
  //   }

  //   let url =
  //     this.gitGatewayApi +
  //     '/projects/' +
  //     encodeURIComponent(projectPath) +
  //     '/files/' +
  //     encodeURIComponent(path);
  // }

  async isProjectExist(projectPath) {
    if (!this.isConfigRight) {
      return false;
    }

    let url = `${this.gitGatewayApi}/projects/${encodeURIComponent(projectPath) || ''}/exist`
    let adminToken = await this.getAdminToken()

    let axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${adminToken || ''}`
      }
    })

    let result = await axiosInst.get(url)

    if (result && result.data) {
      return true
    } else {
      return false
    }
  }
}

module.exports = app => {
  const config = app.config.self;

  app.gitGateway = new GitGateway(config, app);
};
