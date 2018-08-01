const express = require('express');
const bodyparser = require('body-parser');
const WError = require('verror').WError;

const config = require('./config.json');
const logger = require('./logger');
const spoiler = require('./spoiler');

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

const MIN_TEMP = -40;
const MAX_TEMP = 50;

const getResponseBody = function (city) {
  return {
    city,
    temperature: Math.floor(Math.random() * (MAX_TEMP - MIN_TEMP) + MIN_TEMP)
  };
};

const requestHandler = function (req, res) {
  const city = req.body && req.body.city;

  if (!city) {
    replyWithError(req, res, 'City not specified.', 400);
    return;
  }

  const responseBody = getResponseBody(city);

  const spoilerIndex = req.query && req.query.spoiler;

  if (spoilerIndex !== undefined) {
    spoiler.spoilByIndex(req, res, responseBody, spoilerIndex, replyWithError);
    return;
  }

  if (Math.random() < config.successProbability) {
    res
      .status(200)
      .json(responseBody);
  } else {
    spoiler.useRandomSpoiler(req, res, responseBody, replyWithError);
  }
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
    this.app.post('/weather', [
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
