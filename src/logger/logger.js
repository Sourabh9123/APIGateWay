import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { config } from "../config.js";

const { combine, timestamp, json, metadata } = winston.format;

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
        metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
        json()
    ),
});

export const logger = winston.createLogger({
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
        json()
    ),
    transports: [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});
