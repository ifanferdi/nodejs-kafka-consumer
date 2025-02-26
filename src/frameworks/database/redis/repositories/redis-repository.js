const { promisify } = require("util");
const logger = require("../../../helpers/pino-logger");

const appError = require("../../../helpers/app-error");

module.exports = (client) => {
  /**
   * Get Data From Redis
   * @param key
   * @returns {Promise<unknown>}
   */
  const getData = (key) => {
    return new Promise((resolve) => {
      client.get(key, (err, data) => {
        if (err) {
          logger.error(err);
        } else {
          // logger.info(`Success retrieve data from redis: ${key}`);
          resolve(JSON.parse(data));
        }
      });
    });
  };

  const getAllKey = async (index) => {
    const getKeys = promisify(client.sendCommand).bind(client, ["KEYS", index]);
    try {
      return await getKeys();
    } catch (error) {
      throw new appError("Data not found in Redis");
    }
  };

  /**
   * Save Data To Redis
   * @param key
   * @param value
   * @returns {Promise<void>}
   */
  const setData = async (key, value) => {
    logger.info(`Success save data to redis: ${key}`);
    await client.set(key, JSON.stringify(value));
  };

  /**
   * Delete Redis Data From Key
   * @param key
   * @returns {Promise<void>}
   */
  const destroyData = async (key) => {
    logger.info(`Success delete data from redis: ${key}`);
    await client.del(key);
  };

  const getKeys = (pattern) => {
    return new Promise((resolve) => {
      client.keys(pattern, (err, data) => {
        if (err) {
          logger.error(err);
          return;
        }

        resolve(data);
      });
    });
  };

  return { getData, setData, destroyData, getAllKey, getKeys };
};
