import { authenticate } from "../middleware/auth.js";
import { rateLimit } from "../middleware/ratelimit.js";
import { v1Router } from "./v1/index.js";
import { logger } from "../logger/logger.js";

export async function router(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    logger.info(`Incoming request: ${method} ${path}`, { ip });

    // 1. Rate Limiting
    const rateLimitResponse = await rateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Authentication (Apply to all /api routes for this example)
    if (path.startsWith("/api")) {
        const authError = await authenticate(req);
        if (authError) return authError;
    }

    // 3. Routing
    // Expected path: /api/v1/domain/...
    const segments = path.split("/").filter(Boolean); // ["api", "v1", "user", "123"]

    if (segments[0] === "api") {
        const version = segments[1];
        if (version === "v1") {
            return v1Router(req, segments.slice(1)); // Pass ["v1", "user", ...]
        }
    }

    logger.warn(`Route not found: ${method} ${path}`, { ip });
    return new Response("Not Found", { status: 404 });
}
