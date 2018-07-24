const ServerController = require('./servercontroller');
const Server = require('./server');
const logger = require('./logger');
const config = require('./config.json');

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception');

  logger.error(error);
});

const controller = new ServerController(
  config.aliveSeconds,
  config.probabilityOfDeath,
  config.deadSeconds
);

const server = new Server(config.server.port);

controller.asyncOn('start', (done) => {
  server.start(done);
});

controller.asyncOn('stop', (done) => {
  server.stop(done);
});

controller.startCycle();
