require("dotenv").config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  appUrl: process.env.APP_URL || "http://localhost:3000",
  ip: process.env.HOST || "http://localhost",
  app: process.env.APP || null,
  institute: process.env.INSTITUTE || null,
  database: {
    dialect: process.env.DB_DIALECT || "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "3306",
    dbname: process.env.DB_NAME || "sql",
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "localhost"
  },
  filesystem: process.env.FILESYSTEM || "local",
  s3: {
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET,
    endpoint: process.env.S3_API || "http://localhost:9000",
    forcePathStyle: true,
    bucketName: process.env.S3_BUCKETNAME || "storage"
  },
  url: {
    api: {
      profile: process.env.PROFILE_URL,
      question: process.env.QUESTION_URL,
      schedule: process.env.SCHEDULE_URL,
      course: process.env.COURSE_URL,
      assessmentCbt: process.env.ASSESSMENT_CBT_URL,
      notification: process.env.NOTIFICATION_URL,
      vts: process.env.VTS_URL || "http://192.168.101.36/pusditek/public/api/v1/main"
    },
    web: {
      //
    }
  },
  frontUrl: {
    ubk: process.env.UBK_URL
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    password: process.env.REDIS_PASSWORD || "root"
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || "amqp://localhost",
    scheduleTestExchange: process.env.SCHEDULE_TEST_EXCHANGE || "schedule.test",
    scheduleExchange: process.env.SCHEDULE_EXCHANGE || "schedule",
    scheduleAnalyticExchange: process.env.SCHEDULE_ANALYTIC_EXCHANGE || "schedule.analytic.exchange",
    notification_exchange: process.env.NOTIFICATION_EXCHANGE || "notif.exchange"
  },
  meilisearch: {
    host: process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700",
    key: process.env.MEILISEARCH_KEY || null
  },
  jwtSecret: process.env.JWT_SECRET || "jkl!±@£!@ghj1237",
  applicationBehaviour: {
    formType: [1, 2, 3],
    formTypeText: {
      1: "Pilihan Ganda",
      2: "Essay",
      3: "Dokumen"
    }
  },
  sentry: { dsn: process.env.SENTRY_DSN },
  kafka: {
    host: process.env.KAFKA_HOST.split(","),
    topic: process.env.KAFKA_TOPIC.split(","),
    groupId: process.env.KAFKA_GROUP_ID
  },
  elasticsearch: {
    host: process.env.ELASTICSEARCH_HOST || "http://127.0.0.1:9200",
    key: process.env.ELASTICSEARCH_KEY || "",
    indexes: {
      cbt_bela_negara: process.env.ELASTICSEARCH_CBT_BN_INDEX || "cbt-bela-negara"
    }
  }
};

module.exports = config;
