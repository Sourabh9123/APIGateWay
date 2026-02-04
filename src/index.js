import { config } from "./config.js";
import { router } from "./routes/router.js";
import { logger } from "./logger/logger.js";

const port = config.app.port;

logger.info(`Starting API Gateway on port ${port}...`);

Bun.serve({
    port: port,
    async fetch(req) {
        try {
            return await router(req);
        } catch (error) {
            console.error("Internal Server Error:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    },
});
