import * as winston from "winston";
import { format } from "logform";

export const logger: winston.Logger = winston.createLogger({
  level: "silent",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(
      (info) => `\n${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [new winston.transports.Console()]
});
