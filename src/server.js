const express = require('express');
const bodyparser = require('body-parser');
const WError = require('verror').WError;

const logger = require('./logger');

const replyWithError = function (req, res, error, status) {
  status = status || 500;

  const id = logger.warn(error);

  res.status(status).json({
    id,
    message: error && error.message || error // if string is passed
  });
};

const parseInput = function (req, res, next) {
  const body = req.body.toString();
  const isContentTypeValid = req.is('application/json');

  if (!isContentTypeValid) {
    replyWithError(req, res, 'Content-Type is not application/json.', 400);
  } else if (body.length === 0) {
    req.body = {};
    next();
  } else {
    let bodyObject;

    try {
      bodyObject = JSON.parse(body);
    } catch (error) {
      replyWithError(req, res, new WError(error, `Failed to parse body: ${body}.`), 400);
      return;
    }

    req.body = bodyObject;
    next();
  }
};

const requestHandler = function (req, res) {
  res.status(200).json({
    message: 'success'
  });
};

const notFoundHandler = function (req, res) {
  replyWithError(req, res, 'Unhandled path or method. Use POST to \'/\'', 404);
};

const parserWrapper = function (parser) {
  return function (req, res, next) {
    parser(req, res, (error) => {
      if (error) {
        replyWithError(req, res, error, 400);
      } else {
        next();
      }
    });
  };
};

class Server {
  constructor(port) {
    this.port = port;
    this.app = express();
    this.app.use(parserWrapper(bodyparser.raw({
      limit: '100kb',
      type: '*/*'
    })));

    this.bindRoutes();
  }

  bindRoutes() {
    this.app.post('/', [
      parseInput,
      requestHandler
    ]);

    this.app.all('*', notFoundHandler);
  }

  start(done) {
    this.server = this.app.listen(this.port, () => {
      logger.info(`Listening on port ${this.port}.`);

      done();
    });

    this.server.on('error', (error) => {
      logger.error(error);
    });
  }

  stop(done) {
    this.server.close((error) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Server stopped.');
      }

      done();
    })
  }
}

module.exports = Server;
