export const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        insightsPort: parseInt(process.env.REDIS_INSIGHTS_PORT || "8001", 10),
    },
    rateLimit: {
        windowSize: parseInt(process.env.RATE_LIMIT_WINDOW || "60", 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
        maxAuthRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "500", 10),
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "supersecretkey",
    },
    services: {
        user: process.env.SERVICE_ADDR_USER || "http://localhost:3001",
        payment: process.env.SERVICE_ADDR_PAYMENT || "http://localhost:3002",
    }
};
