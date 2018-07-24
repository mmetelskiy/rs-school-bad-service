const logger = require('./logger');

class ServerController {
  constructor(aliveSeconds, probabilityOfDeath, deadSeconds) {
    this.aliveSeconds = aliveSeconds;
    this.probabilityOfDeath = probabilityOfDeath;
    this.deadSeconds = deadSeconds;

    this.asyncActions = {};
  }

  start(callback) {
    logger.info('Starting...');

    this.asyncEmit('start', () => {
      logger.info('Started.');

      callback();
    });
  }

  stop(callback) {
    logger.info('Stopping...');

    this.asyncEmit('stop', () => {
      logger.info('Stopped.');

      callback();
    });
  }

  asyncEmit(eventName, callback) {
    if (this.asyncActions[eventName]) {
      process.nextTick(this.asyncActions[eventName], callback);
    } else {
      process.nextTick(callback);
    }
  }

  asyncOn(eventName, asyncListener/*(done)*/) {
    this.asyncActions[eventName] = asyncListener;
  }

  shouldIDie() {
    return Math.random() < this.probabilityOfDeath;
  }

  waitForRespawn() {
    logger.info(`Dead for ${this.deadSeconds} seconds.`);

    setTimeout(() => {
      this.start(() => {
        this.waitForDeath();
      });
    }, this.deadSeconds * 1000);
  }

  waitForDeath() {
    logger.info(`Trying to die in ${this.aliveSeconds} seconds.`);

    setTimeout(() => {
      const shouldDie = this.shouldIDie();

      if (shouldDie) {
        this.stop(() => {
          this.waitForRespawn();
        });
      } else {
        this.waitForDeath();
      }
    }, this.aliveSeconds * 1000);
  }

  startCycle() {
    // emit start
    // in x seconds emit stop with the probability of y
    // wait for z seconds and... emit start
    this.start(() => {
      if (this.probabilityOfDeath !== 0) {
        this.waitForDeath();
      }
    });
  }
}

module.exports = ServerController;
