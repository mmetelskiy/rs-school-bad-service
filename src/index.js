const WError = require('verror').WError;

const ServerController = require('./servercontroller');
const Server = require('./server');
const logger = require('./logger');
const config = require('./config.json');

process.on('uncaughtException', (error) => {
  logger.error(new WError(error, 'Uncaught exception'));
});

process.on('unhandledRejection', (error) => {
  logger.error(new WError(error, 'Unhandled rejection'));
})

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
