
import { Server } from 'hapi';
import { env, port, host } from 'lib/config';
import 'lib/database';

const server = new Server();

server.connection({
  port,
  host,
  routes: { cors: true }
});

require('./authStrategy')(server);

server.register([
  require('blipp')
], () => {
  server.route(require('lib/routes'));

  server.start(() => {
    console.log(`ENV [${env}]`);
    console.log('API up and running at:', server.info.uri);
  });

});

export default server;
