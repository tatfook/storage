import Koa from 'koa'

import server from "@/server.js";
import config from "@/config.js";

function start () {
  const app = new Koa()

  server(app);

  const host = config.host || '127.0.0.1'
  const port = config.port || 3000
  app.listen(port, host)
  console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
}

start()
