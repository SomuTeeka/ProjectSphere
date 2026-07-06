import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, QueryResult, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");

    if (!connectionString) {
      throw new Error("DATABASE_URL is required to run the ProjectSphere API.");
    }

    this.pool = new Pool({
      connectionString,
    });
  }

  async onModuleInit() {
    await this.query(`
      CREATE TABLE IF NOT EXISTS students (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        institution_name TEXT NOT NULL,
        course TEXT NOT NULL,
        year TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        contact_number TEXT NOT NULL,
        github_profile TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
