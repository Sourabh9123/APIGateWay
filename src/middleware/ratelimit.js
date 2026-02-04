import { redis } from "../core/redis.js";
import { verifyToken } from "./auth.js";
import { config } from "../config.js";
import { logger } from "../logger/logger.js";

const WINDOW_SIZE_IN_SECONDS = config.rateLimit.windowSize;
const MAX_GUEST_REQUESTS = config.rateLimit.maxRequests;
const MAX_AUTH_REQUESTS = config.rateLimit.maxAuthRequests;

export async function rateLimit(req) {
    try {
        const user = verifyToken(req);
        let key, limit;
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (user && user.id) {
            key = `rate_limit:user:${user.id}`;
            limit = MAX_AUTH_REQUESTS;
        } else {
            key = `rate_limit:ip:${ip}`;
            limit = MAX_GUEST_REQUESTS;
        }

        const currentRequests = await redis.incr(key);

        if (currentRequests === 1) {
            await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
        }

        if (currentRequests > limit) {
            logger.warn("Rate limit exceeded", {
                key,
                limit,
                currentRequests,
                ip,
                path: new URL(req.url).pathname
            });
            return new Response(JSON.stringify({ error: "Too Many Requests" }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
            });
        }

        return null; // No error, proceed
    } catch (error) {
        logger.error("Rate limit internal error", { error: error.message });
        return null;
    }
}
