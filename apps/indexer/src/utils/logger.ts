import * as winston from "winston";
import { format } from "logform";

// Cloud Run reads `severity` from JSON lines; plain text is logged as DEFAULT and the error alert never fires.
const severity = format((info) => {
  info.severity = info.level === "warn" ? "WARNING" : info.level.toUpperCase();
  return info;
});

export const logger: winston.Logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    severity(),
    format.json()
  ),
  transports: [new winston.transports.Console()]
});
