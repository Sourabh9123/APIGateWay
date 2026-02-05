import { authenticate } from "../middleware/auth.js";
import { rateLimit } from "../middleware/ratelimit.js";
import { v1Router } from "./v1/index.js";
import { logger } from "../logger/logger.js";

export async function router(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;


    // 1. Rate Limiting
    const rateLimitResponse = await rateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Authentication
    const PUBLIC_ROUTES = [
        { path: "/api/v1/user", method: "POST" }, // Example: Registration
        { path: "/api/v1/auth/login", method: "POST" },
    ];

    const isPublic = PUBLIC_ROUTES.some(route =>
        path === route.path && (route.method ? method === route.method : true)
    );

    if (path.startsWith("/api") && !isPublic) {
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

    return new Response("Not Found", { status: 404 });
}

