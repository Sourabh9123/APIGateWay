import { logger } from "../logger/logger.js";
import { correlationContext } from "./correlation-context.js";

export async function correlationIdMiddleware(req, next) {
    // Custom Correlation ID: TIMESTAMP + PID + UUID + SHUFFLE
    const generateId = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const pid = process.pid.toString(36).toUpperCase();
        const uuidPart = crypto.randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();

        // Combine all parts
        let combined = (timestamp + pid + uuidPart).split("");

        // Fisher-Yates shuffle for maximum entropy
        for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
        }

        return combined.join("");
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

