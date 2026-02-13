import { logger } from "../logger/logger.js";
export async function correlationIdMiddleware(req, next) {
    // Custom Correlation ID: UUID Prefix (8) + Random String (4) = 12 chars
    const generateId = () => {
        const uuidPart = crypto.randomUUID().split("-")[0]; // First 8 chars of UUID
        const randomPart = Math.random().toString(36).substring(2, 6); // 4 random chars
        return `${uuidPart}${randomPart}`;
    };


    const correlationId = req.headers.get("x-correlation-id") || generateId();
    const startTime = Date.now();
    const url = new URL(req.url);

    // Attach correlation info to request
    req.correlationId = correlationId;
    req.logger = logger.child({ correlationId });

    // Extract IP addresses
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : "unknown";

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
            req.logger.error(`Request Failed: ${logMsg}`, logData);
        } else if (status >= 400) {
            req.logger.warn(`Request Completed with Warning: ${logMsg}`, logData);
        } else {
            req.logger.info(`Request Completed: ${logMsg}`, logData);
        }

        // Add the correlation ID to the response headers
        if (response instanceof Response) {
            response.headers.set("x-correlation-id", correlationId);
            response.headers.set("x-response-time", `${duration}ms`);
        }
    }

    return response;
}

