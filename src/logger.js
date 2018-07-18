const { createLogger, config, format, transports } = require('winston');
const { combine, timestamp, prettyPrint, simple } = format;

module.exports = createLogger({
  level: 'info',
  levels: config.syslog.levels,
  format: combine(
    timestamp(),
    simple(),
    prettyPrint()
  ),
  transports: new transports.Console()
});
