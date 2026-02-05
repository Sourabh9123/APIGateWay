import { AsyncLocalStorage } from "node:async_hooks";
import { logger } from "../logger/logger.js";
import { correlationContext } from "./correlation-context.js";

export async function correlationIdMiddleware(req, next) {
    // Custom Correlation ID: TIMESTAMP (base36) + PID (base36) + RANDOM
    const generateId = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const pid = process.pid.toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `${timestamp}${pid}${random}`;
    };

    const correlationId = req.headers.get("x-correlation-id") || generateId();
    const startTime = Date.now();
    const url = new URL(req.url);

    // Extract IP addresses
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : "unknown";

    return correlationContext.run({ id: correlationId, seq: 1 }, async () => {

        let response;
        let error = null;

        try {
            response = await next(req);
        } catch (err) {
            error = err;
            response = new Response(JSON.stringify({ error: "Internal Server Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        } finally {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const status = response?.status || 500;

            // Extract service name from path (e.g., /api/v1/user/123 -> user)
            const segments = url.pathname.split("/").filter(Boolean);
            let service = "gateway";
            if (segments[0] === "api" && segments[1] === "v1" && segments[2]) {
                service = segments[2];
            }

            const logData = {
                method: req.method,
                path: url.pathname,
                service,
                ip: clientIp,
                forwardedFor,
                realIp,
                status,
                durationMs: duration,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            };



            const logMsg = `${req.method} ${url.pathname} [${service}] - ${status} (${duration}ms)`;

            if (error) {
                logData.error = error.message;
                logger.error(`Request Failed: ${logMsg}`, logData);
            } else if (status >= 400) {
                logger.warn(`Request Completed with Warning: ${logMsg}`, logData);
            } else {
                logger.info(`Request Completed: ${logMsg}`, logData);
            }

            // Add the correlation ID to the response headers
            if (response instanceof Response) {
                response.headers.set("x-correlation-id", correlationId);
                response.headers.set("x-response-time", `${duration}ms`);
            }
        }


        return response;
    });
}

