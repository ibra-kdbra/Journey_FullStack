import "dotenv/config";
import { DataSource } from "typeorm";

/**
 * TypeORM 0.3 removed the global connection manager - getConnectionOptions,
 * createConnection and getRepository all went with it - in favour of an
 * explicit DataSource that owns its own repositories.
 *
 * Connection details come from the environment. They used to live in
 * ormconfig.json, which meant a database URL, username and password were
 * committed to the repository.
 */
const AppDataSource = new DataSource({
    type: "postgres",
    // DATABASE_URL wins when set, which is what CI provides; the discrete
    // variables are the local path.
    ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
              host: process.env.DB_HOST ?? "localhost",
              port: Number(process.env.DB_PORT ?? 5432),
              username: process.env.DB_USER ?? "postgres",
              password: process.env.DB_PASSWORD ?? "postgres",
              database: process.env.DB_NAME ?? "rentx",
          }),
    // Anchored to __dirname and matching both extensions. A bare relative glob
    // resolves against process.cwd(), which differs between `npm run dev` and a
    // migration run, and .ts-only would find nothing once the project is built.
    entities: [`${__dirname}/../../../modules/**/infra/typeorm/entities/*.{ts,js}`],
    migrations: [`${__dirname}/migrations/*.{ts,js}`],
});

export { AppDataSource };
