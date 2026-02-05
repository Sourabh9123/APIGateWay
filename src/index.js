import { config } from "./config.js";
import { router } from "./routes/router.js";
import { logger } from "./logger/logger.js";
import { correlationIdMiddleware } from "./middleware/correlation.js";

const port = config.app.port;

logger.info(`Starting API Gateway on port ${port}...`);

Bun.serve({
    port: port,
    async fetch(req) {
        try {
            return await correlationIdMiddleware(req, router);
        } catch (error) {
            console.error("Internal Server Error:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    },
});

