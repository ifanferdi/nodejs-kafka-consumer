const getAllElasticsearch = require("./get-all-elasticsearch");
const getByIdElasticsearch = require("./get-by-id-elasticsearch");
const createElasticsearch = require("./create-elasticsearch");
const updateElasticsearch = require("./update-elasticsearch");
const deleteElasticsearch = require("./delete-elasticsearch");

module.exports = (repositories) => {
  return {
    getAllElasticsearch: getAllElasticsearch.bind(null, repositories),
    getByIdElasticsearch: getByIdElasticsearch.bind(null, repositories),
    createElasticsearch: createElasticsearch.bind(null, repositories),
    updateElasticsearch: updateElasticsearch.bind(null, repositories),
    deleteElasticsearch: deleteElasticsearch.bind(null, repositories)
  };
};
