import Redis from "ioredis";
import { config } from "../config.js";
import { logger } from "../logger/logger.js";

const redisHost = config.redis.host;
const redisPort = config.redis.port;

logger.info(`Connecting to Redis at ${redisHost}:${redisPort}`);

let lastRedisErrorLog = 0;
const REDIS_LOG_COOLDOWN = 60000; // Log once every 60 seconds

export const redis = new Redis({
    host: redisHost,
    port: parseInt(redisPort, 10),
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        return Math.min(times * 200, 5000); // More relaxed backoff retry
    }
});

redis.on("error", (err) => {
    const now = Date.now();
    if (now - lastRedisErrorLog > REDIS_LOG_COOLDOWN) {
        logger.error("Redis connection error (throttled)", { error: err.message });
        lastRedisErrorLog = now;
    }
});
