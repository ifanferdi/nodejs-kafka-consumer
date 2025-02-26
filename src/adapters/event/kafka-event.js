const kafka = require("../../frameworks/webserver/kafka");
const config = require("../../config/config");
const { cbt_bela_negara: index } = config.elasticsearch.indexes;
const logger = require("../../frameworks/helpers/pino-logger");

module.exports = async ({ useCases }) => {
  const { elasticsearchUseCases } = useCases;

  async function consume() {
    await kafka(async function ({ value }) {
      if (value) {
        const { prefixId, routing } = getOptionData(value.source);

        switch (value.op.toLowerCase()) {
          case "c":
          case "r":
            const data = assignRelationKey(value.after, value.source);
            await elasticsearchUseCases.createElasticsearch({ index, option: { prefixId, routing } }, data);
            logger.info(`[CREATE] elasticsearch with id: ${prefixId}-${data.id}`);
            break;
          case "u":
            await elasticsearchUseCases.updateElasticsearch(index, prefixId, value.after);
            logger.info(`[UPDATE] elasticsearch with id: ${prefixId}-${value.after.id}`);
            break;
          case "d":
            await elasticsearchUseCases.deleteElasticsearch(index, { ...value.before, prefixId });
            logger.info(`[DELETE] elasticsearch with id: ${prefixId}-${value.before.id}`);
            break;
        }
      }
    });
  }

  function getOptionData(source) {
    if (source.table === "schedules") {
      return { prefixId: "schedule", routing: 1 };
    } else if (source.table === "users") {
      // todo: recheck table name
      return { prefixId: "user", routing: 2 };
    }

    return {};
  }

  function assignRelationKey(data, source) {
    if (source.table === "schedules") {
      return { ...data, my_join_field: { name: "schedule", parent: `user-${data.authorId}` } };
    } else if (source.table === "users") {
      // todo: recheck table name
      return { ...data, my_join_field: "author" };
    }

    return {};
  }

  return { consume };
};
