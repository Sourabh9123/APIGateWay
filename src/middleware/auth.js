import jwt from "jsonwebtoken";

import { config } from "../config.js";
import { logger } from "../logger/logger.js";

const SECRET_KEY = config.auth.jwtSecret;

export function verifyToken(req) {
    const authHeader = req.headers.get("Authorization");
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Authentication failed: Missing or malformed Bearer token", { ip, path: new URL(req.url).pathname });
        return null;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        logger.info("Authentication successful", { userId: decoded.id, ip });
        return decoded;
    } catch (err) {
        logger.warn("Authentication failed: Invalid token", { ip, error: err.message, path: new URL(req.url).pathname });
        return null;
    }
}

export async function authenticate(req) {
    const user = verifyToken(req);

    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid or Missing Token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Attach user to request
    req.user = user;
    return null;
}
