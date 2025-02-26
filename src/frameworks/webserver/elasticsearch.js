const { Client } = require("@elastic/elasticsearch");

module.exports = async (config) => {
  try {
    return new Client({ node: config.elasticsearch.host, auth: { apiKey: config.elasticsearch.key } });
  } catch ({ meta }) {
    console.error("Elasticsearch client failed: ", meta.meta.request);
  }
};
