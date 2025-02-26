const { v4: uuidv4 } = require("uuid");
const logger = require("./pino-logger");

/**
 *
 * @param {*} cache Redis Connection
 * @param {*} channel channel From RabbitMQ
 * @returns
 */
const delayTrustQueue = (cache, channel) => {
  const prefixKeyTrust = "mq_trustkey:";

  // use this as callback for consume mq messages that
  function delayTrustConsume(queueName, keyTrust, binding, cb) {
    const uuidValidate = async (msg) => {
      if (
        (await cache.get(prefixKeyTrust + keyTrust + JSON.parse(msg.content.toString())[binding])) ===
        msg.properties.messageId
      )
        return true;
      logger.info("Status Not Changed : UUID Expired, Schedule Has Been Updated Before");
      return false;
    };

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        if (await uuidValidate(msg)) await cb(msg);
        channel.ack(msg);
      }
    });
  }

  async function delayTrustPublish(exchange, queueName, keyTrust, delay, data) {
    let uuid = uuidv4();

    const publish = channel.publish(exchange, queueName, Buffer.from(data), {
      headers: { "x-delay": delay },
      messageId: uuid
    });

    await cache.set(prefixKeyTrust + keyTrust, uuid);

    return publish;
  }

  async function revokeKeyTrust(keyTrust) {
    cache.del(prefixKeyTrust + keyTrust);
  }

  return { delayTrustConsume, delayTrustPublish, revokeKeyTrust };
};
module.exports = delayTrustQueue;
