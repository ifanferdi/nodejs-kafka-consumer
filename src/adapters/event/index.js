const kafkaEvent = require("./kafka-event");

module.exports = async (params) => {
  /*===================================================DEFINE========================================================== */
  const eventKafka = await kafkaEvent(params);
  /*===================================================LISTENING EVENT========================================================== */

  await eventKafka.consume();
};
