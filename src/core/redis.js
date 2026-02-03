import Redis from "ioredis";

import { config } from "../config.js";

const redisHost = config.redis.host;
const redisPort = config.redis.port;

console.log(`Connecting to Redis at ${redisHost}:${redisPort}`);

export const redis = new Redis({
    host: redisHost,
    port: parseInt(redisPort, 10),
});
