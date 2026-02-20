# Velais Client Dashboard

A full-stack sprint management dashboard that connects to Azure DevOps and displays work items across Kanban, table, and analytics views.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, TanStack React Query, Recharts
- **Backend:** Hono, WorkOS (auth), Azure DevOps API
- **Runtime:** Bun
- **Deployment:** Vercel (edge functions)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A [WorkOS](https://workos.com/) account with AuthKit configured
- An Azure DevOps organization with a Personal Access Token (PAT)

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd velais-client-dashboard
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

4. Fill in the required environment variables:

   | Variable | Description |
   |---|---|
   | `WORKOS_API_KEY` | WorkOS API key (server-side) |
   | `WORKOS_CLIENT_ID` | WorkOS client ID (server-side) |
   | `VITE_WORKOS_CLIENT_ID` | WorkOS client ID (client-side) |
   | `AZURE_DEVOPS_ORG` | Azure DevOps organization name |
   | `AZURE_DEVOPS_PAT` | Azure DevOps Personal Access Token |

5. Start the development servers:

   ```bash
   bun run dev
   ```

   This starts the Vite client on `http://localhost:5173` and the Hono API server on `http://localhost:3001`.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Run client + server concurrently |
| `bun run dev:client` | Vite dev server only |
| `bun run dev:server` | Hono backend only (with watch) |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview the production build |
| `bun run lint` | Lint with Biome |
| `bun run format` | Auto-format with Biome |

## Project Structure

```
src/                  React client
  components/
    ui/               shadcn-style primitives
    kanban/            Kanban board (Board, Column, Card)
    table/            Table view with filters
    analytics/        Charts (StateBreakdown, ProgressSummary, AssigneeBreakdown)
    layout/           Shell and SprintHeader
  hooks/              useStories, useSummary (React Query)
  lib/                API client, utilities, constants

server/               Hono backend
  middleware/         Auth (WorkOS JWT) and caching (in-memory, 10-min TTL)
  routes/             stories, summary, iterations endpoints
  services/           Azure DevOps client and data transformation
  tenants.ts          Org-to-project/team mapping

shared/               Types and utilities shared between client and server

api/                  Vercel edge function catch-all
```

## Architecture

### Authentication

Users authenticate via WorkOS AuthKit. The backend verifies JWT tokens on every API request and extracts the organization ID to determine the tenant context.

### Multi-Tenancy

Each organization maps to an Azure DevOps project and team via `server/tenants.ts`. Cache keys are scoped per-tenant to prevent data leaks.

### Caching

The backend uses an in-memory cache with a 10-minute TTL, ETag support for conditional responses, and LRU eviction at 500 entries. The client layer uses React Query with a matching 10-minute stale time.

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/health/azure` | Azure DevOps connectivity check |
| `GET /api/stories` | Fetch stories for the current sprint (auth required) |
| `GET /api/summary` | Fetch sprint summary with breakdowns (auth required) |
| `GET /api/iterations` | Fetch iteration/sprint info (auth required) |

## Deployment

Deployed on Vercel. The `vercel.json` rewrites `/api/*` to the Hono edge function and all other routes to the SPA.

## License

Private
