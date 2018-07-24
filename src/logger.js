const VError = require('verror');
const uuid = require('uuid/v4');

const { createLogger, config, format, transports } = require('winston');
const { combine, timestamp, colorize, simple } = format;

const logger = createLogger({
  level: 'info',
  levels: config.syslog.levels,
  format: combine(
    timestamp(),
    simple(),
    colorize()
  ),
  transports: new transports.Console()
});

const getFullStack = function (error) {
  return VError.fullStack(error);
};

const winstonCallWrapper = function (level, argument) {
  const id = uuid();

  let message;

  if (typeof argument === 'string') {
    message = argument;
  } else if (argument instanceof Error) {
    message = getFullStack(argument);
  } else {
    try {
      message = JSON.stringify(argument, null, 2);
    } catch (ignore) {
      message = argument.toString();
    }
  }

  logger.log({
    level,
    message,
    id
  });

  return id;
};

exports.info = function (argument) {
  return winstonCallWrapper('info', argument);
};

exports.warn = function (argument) {
  return winstonCallWrapper('warning', argument);
};

exports.error = function (argument) {
  return winstonCallWrapper('error', argument);
};
