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

    await this.query(`
      ALTER TABLE students
        ADD COLUMN IF NOT EXISTS auth0_sub TEXT,
        ADD COLUMN IF NOT EXISTS username TEXT,
        ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS department TEXT,
        ADD COLUMN IF NOT EXISTS degree TEXT;
    `);

    await this.query(`
      UPDATE students
      SET
        username = COALESCE(username, split_part(email, '@', 1)),
        department = COALESCE(department, course),
        degree = COALESCE(degree, course)
      WHERE username IS NULL OR department IS NULL OR degree IS NULL;
    `);

    await this.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS students_username_unique
      ON students (username)
      WHERE username IS NOT NULL;
    `);

    await this.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS students_auth0_sub_unique
      ON students (auth0_sub)
      WHERE auth0_sub IS NOT NULL;
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS project (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        technologies_used JSONB NOT NULL DEFAULT '[]'::jsonb,
        team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        videos JSONB NOT NULL DEFAULT '[]'::jsonb,
        documentation JSONB NOT NULL DEFAULT '[]'::jsonb,
        external_links JSONB NOT NULL DEFAULT '[]'::jsonb,
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
