const logger = require("../../frameworks/helpers/pino-logger");

module.exports = (app, config) => {
  const { port: PORT, ip: HOST } = config;

  const startServer = () => {
    app.listen(config.port, () => logger.info(`Server running on: ${HOST}:${PORT}`));
  };

  return {
    startServer
  };
};
