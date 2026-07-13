# ProjectSphere

ProjectSphere is a student project showcase and collaboration platform. Students can create a profile, publish projects, discover other students by skills and academic details, and save profiles or projects.

## Features

- Student registration and login with a password policy
- Optional Auth0 sign-in, synchronized to a ProjectSphere student record
- Student profile editing and searchable student discovery
- Project creation, viewing, editing, and deletion
- Project resources: technologies, team members, images, videos, documentation, and external links

## Tech stack

| Area           | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript |
| Backend        | NestJS 11, TypeScript            |
| Database       | PostgreSQL via `pg`              |
| Authentication | Auth0 and credentials            |

## Repository structure

```text
app/                 Next.js App Router pages and client components
app/api/auth0/       Server-side Auth0 session-to-student sync route
app/components/       Shared UI components
lib/                 Auth0 client configuration
server/src/          NestJS API, modules, DTOs, and database service
```

## Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 16 installed locally, Supabase for hosting postgreSQL
- Auth0 - https://auth0.com

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file. Use placeholder values; do not commit secrets.

   ```powershell
   Copy-Item .env.example .env
   ```

3. Update `.env` with your own values:

   ```dotenv
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/projectsphere
   API_PORT=4000
   FRONTEND_ORIGIN=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:4000

   APP_BASE_URL=http://localhost:3000
   AUTH0_DOMAIN=your-tenant.us.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_SECRET=a-long-random-secret
   ```

4. Start PostgreSQL (optional if using an existing PostgreSQL instance):
   pgAdmin4 Tool

5. Start the API in one terminal:

   ```bash
   npm run api:dev
   ```

6. Start the frontend in a second terminal:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000]

The API initializes its `students` and `project` tables on startup.

## Available scripts

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Start the Next.js development server   |
| `npm run api:dev`   | Start the NestJS API through `ts-node` |
| `npm run build`     | Create the production Next.js build    |
| `npm run start`     | Run the production Next.js server      |
| `npm run api:build` | Compile the API to `dist/server`       |

## API overview

The NestJS service runs with the `/api` prefix.

| Method                 | Endpoint                   | Purpose                                    |
| ---------------------- | -------------------------- | ------------------------------------------ |
| `POST`                 | `/api/students/register`   | Register a student using local credentials |
| `POST`                 | `/api/students/login`      | Log in using local credentials             |
| `POST`                 | `/api/students/auth0-sync` | Create or link a student after Auth0 login |
| `GET`                  | `/api/students/search`     | Search students by query and filters       |
| `GET`, `PUT`           | `/api/students/:id`        | Read or update a student profile           |
| `GET`, `POST`          | `/api/projects`            | List or create projects                    |
| `GET`, `PUT`, `DELETE` | `/api/projects/:id`        | Read, update, or delete a project          |

## Deployment Infrastructure: Vercel frontend + Railway API/database

This is the recommended production layout:

```text
Browser -> Vercel (Next.js frontend) -> Railway (NestJS API) -> Railway PostgreSQL
                              |
                              +-> Auth0
```

## Architecture document

See [the architecture design document](docs/ProjectSphere_Architecture_Design.docx) for a fuller view of components, data flow, data model, operational configuration, and known limitations.
