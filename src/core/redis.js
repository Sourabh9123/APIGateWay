import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

console.log(`Connecting to Redis at ${redisHost}:${redisPort}`);

export const redis = new Redis({
    host: redisHost,
    port: parseInt(redisPort, 10),
});
