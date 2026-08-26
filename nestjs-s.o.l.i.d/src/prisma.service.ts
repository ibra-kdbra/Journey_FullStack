import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

/**
 * Prisma 7 no longer reads the connection string from schema.prisma. The client
 * is handed a driver adapter instead, which is what actually opens the database.
 * Swapping SQLite for another engine is now a change to this one constructor
 * plus the adapter package — the schema does not mention a URL at all.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./dev.db',
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('DB Connected!');
  }

  /**
   * Prisma removed the client-level `beforeExit` hook, so shutdown is driven by
   * the Node process event instead.
   */
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
