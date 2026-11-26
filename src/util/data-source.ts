import { config } from "dotenv";
import { DataSource } from "typeorm";
import { buildDataSourceOptions } from "./data-source-options";
import { Logger } from "@nestjs/common";
import { InternalServiceException } from "../module/rest/exception/internal-service.exception";

config(); // Load environment variables from .env

export const dataSource = new DataSource(buildDataSourceOptions());

export const initializeDataSource = async () => {
  const logger = new Logger("DataSource");
  return await dataSource.initialize()
    .then(() => logger.log("Database connection established"))
    .catch(e => {
      console.error(e);
      throw new InternalServiceException(`Database connection failed: ${e.message}`);
    });
}