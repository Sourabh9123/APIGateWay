import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { config } from "../config.js";
const { combine, timestamp, json, metadata } = winston.format;

// Custom format to inject correlation ID if provided in the meta
const correlationFormat = winston.format((info) => {
    // If correlationId is not already set, we can leave it or set a placeholder
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
        json()
    ),
});

export const logger = winston.createLogger({
    level: "info",
    format: combine(
        correlationFormat(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        json()
    ),
    transports: [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                    const cid = correlationId ? ` [${correlationId}]` : "";
                    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
                    return `${timestamp} ${level}:${cid} ${message}${metaStr}`;
                })
            ),
        }),
    ],
});


