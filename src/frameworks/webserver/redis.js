const redis = require("redis");
const config = require("../../config/config");

const startServer = async () => {
  const REDIS_PORT = config.redis.port;
  const REDIS_HOST = config.redis.host;
  const REDIS_PASSWORD = config.redis.password;

  const redisClient = redis.createClient({
    // socket: {
    //   port: REDIS_PORT,
    //   host: REDIS_HOST,
    // },
    url: config.redis.url,
  });

  redisClient.on("error", function (error) {
    console.error(error);
  });

  await redisClient.connect().catch(console.error);

  return redisClient;
};

module.exports = { startServer };
