/** @notice library imports  */
import winston from "winston";
import { Environments } from "./environments";

export const Logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    application: "Express template",
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      level: "info",
      dirname: "logs",
      filename: "application.log",
      silent: Environments.NODE_ENV === "development",
    }),
    new winston.transports.File({
      level: "error",
      dirname: "logs",
      filename: "error.log",
      silent: Environments.NODE_ENV === "development",
    }),
    new winston.transports.Console({
      level: "info",
    }),
  ],
});
