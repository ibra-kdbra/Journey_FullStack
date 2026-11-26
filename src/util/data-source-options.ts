import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { ProductEntity } from "../module/product/entity/product.entity";
import { UserEntity } from "../module/user/entity/user.entity";
import { ClientEntity } from "../module/client/entity/client.entity";
import { OrderEntity } from "../module/order/entity/order.entity";
import { OrderProductEntity } from "../module/order/entity/order-product.entity";
import { NotificationEntity } from "../module/notification/entity/notification.entity";
import { ReportEntity } from "../module/report/entity/report.entity";
import { ProductHistoryLogEntity } from "../module/product/entity/product-history-log.entity";

const REQUIRED_DB_VARS = ["MYSQLDB_HOST", "MYSQLDB_USER", "MYSQLDB_PASSWORD", "MYSQLDB_NAME"] as const;

/**
 * Builds the TypeORM options from the environment. Credentials are never
 * defaulted: a missing variable aborts startup instead of silently connecting
 * as user/password. The schema is only ever changed by migrations
 * (src/migration), never by `synchronize`.
 */
export function buildDataSourceOptions(env: Record<string, string | undefined> = process.env): MysqlConnectionOptions {
  const missing = REQUIRED_DB_VARS.filter(name => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required database environment variable(s): ${missing.join(", ")}`);
  }
  const port = env.MYSQLDB_PORT ? Number(env.MYSQLDB_PORT) : 3306;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid MYSQLDB_PORT: ${env.MYSQLDB_PORT}`);
  }
  return {
    type: "mysql",
    host: env.MYSQLDB_HOST,
    port,
    username: env.MYSQLDB_USER,
    password: env.MYSQLDB_PASSWORD,
    database: env.MYSQLDB_NAME,
    entities: [
      UserEntity,
      ClientEntity,
      ProductEntity,
      OrderEntity,
      OrderProductEntity,
      NotificationEntity,
      ReportEntity,
      ProductHistoryLogEntity
    ],
    synchronize: false,
    migrations: [`${__dirname}/../migration/*.{js,ts}`],
    migrationsRun: true,
  };
}
