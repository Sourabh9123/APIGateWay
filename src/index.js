import { router } from "./routes/router.js";

const port = process.env.PORT || 3000;

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
