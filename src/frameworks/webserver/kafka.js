const { Kafka } = require("@confluentinc/kafka-javascript").KafkaJS;
const config = require("../../config/config");
const logger = require("../../frameworks/helpers/pino-logger");

module.exports = async (cb) => {
  try {
    const kafka = new Kafka({ kafkaJS: { brokers: config.kafka.host } });

    const consumer = await kafka.consumer({
      kafkaJS: { autoCommit: true, groupId: config.kafka.groupId, fromBeginning: true }
    });
    await consumer
      .connect()
      .then(() => logger.info("Kafka successfully connected to: " + JSON.stringify(config.kafka.host)));

    await consumer.subscribe({ topics: config.kafka.topic });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) =>
        cb({ topic, partition, message, value: JSON.parse(message.value) })
    });
  } catch (e) {
    console.error("--- KAFKA ERROR ---");
    console.error(e);
  }
};
