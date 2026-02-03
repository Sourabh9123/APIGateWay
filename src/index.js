import { config } from "./config.js";
import { router } from "./routes/router.js";

const port = config.app.port;

console.log(`Starting API Gateway on port ${port}...`);

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
