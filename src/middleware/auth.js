import jwt from "jsonwebtoken";

import { config } from "../config.js";

const SECRET_KEY = config.auth.jwtSecret;

export function verifyToken(req) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
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

    // Attach user to request if possible or return null to proceed
    req.user = user;
    return null;
}
