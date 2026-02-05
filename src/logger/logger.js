import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { config } from "../config.js";
import { correlationContext } from "../middleware/correlation-context.js";

const { combine, timestamp, json, metadata } = winston.format;

// Custom format to inject correlation ID from AsyncLocalStorage with monotonic sequence
const correlationFormat = winston.format((info) => {
    const context = correlationContext?.getStore();
    if (context && typeof context === "object") {
        // Increment sequence for each log within the same request context
        info.correlationId = `${context.id}-${context.seq++}`;
    } else if (context) {
        info.correlationId = context;
    }
    return info;
});


// Ensure logs directory exists (Bun will handle this or we rely on Docker volumes)
const logDir = config.logging.logDir;

const fileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        metadata({ fillExcept: ["message", "level", "timestamp", "label", "correlationId"] }),
        json()
    ),
});

export const logger = winston.createLogger({
    level: "info",
    format: combine(
        correlationFormat(), // Combined format runs first
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        metadata({ fillExcept: ["message", "level", "timestamp", "label", "correlationId"] }),
        json()
    ),
    transports: [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                    const cid = correlationId ? ` [${correlationId}]` : "";
                    return `${timestamp} ${level}:${cid} ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
                })
            ),
        }),
    ],
});


