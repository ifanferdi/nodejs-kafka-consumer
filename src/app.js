(async () => {
  require("dotenv").config();
  const config = require("./config/config");
  const express = require("express");
  const expressConfig = require("./frameworks/webserver/express");
  const serverConfig = require("./frameworks/webserver/server");
  const elasticsearch = require("./frameworks/webserver/elasticsearch");

  const app = express();

  //SENTRY
  const sentry = require("./frameworks/debug/sentry");
  const sentryInit = sentry(app, config);
  sentryInit.beforeControllers();

  expressConfig(app);
  const server = serverConfig(app, config);
  server.startServer();

  const elasticsearchClient = await elasticsearch(config);

  /*===================================================IMPORT========================================================== */
  // EVENT
  const events = require("./adapters/event/index");
  // REPOSITORY
  const elasticsearchRepository = require("./frameworks/database/elasticsearch/repositories/elasticsearch-repository");
  // USE CASE
  const elasticsearchUseCase = require("./application/use-cases/elasticsearch/index");

  /*===================================================DEFINE========================================================== */
  // MODELS
  const models = {};
  // HELPER
  const helpers = {};
  // REPOSITORIES
  const repositories = {
    elasticsearchRepository: elasticsearchRepository(elasticsearchClient)
  };
  // USE CASES
  const useCases = { elasticsearchUseCases: elasticsearchUseCase(repositories) };
  // CONTROLLERS
  const controllers = {};

  await events({ repositories, useCases });
  sentryInit.afterControllers();
})();
