


class Git{
  constructor(config, app) {
		this.config = config;
    this.app = app;
    this.isConfigRight = true

    if (!this.app ||
			!this.app.config ||
			!this.app.config.self) {
				this.isConfigRight = false;
			}

    this.gitGatewayApi = this.app.config.self.gitGatewayURL || '';
		this.paracraftDefaultProject = this.app.config.self.paracraftDefaultProject || '';

    if (!this.gitGatewayApi || !this.paracraftDefaultProject) {
      this.isConfigRight = false;
		}
		
		if (!this.app || !this.app.axios) {
			this.isConfigRight = false;
    }
  }
  
  getTree() {
    if (!this.isConfigRight) {
      return []
    }

    
  }

  getContent() {

  }

  writeFile() {

  }

  deleteFile() {
    
  }
}

module.exports = app => {
  const config = app.config.self;

  app.git = new Git(config, app)
}