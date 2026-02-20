# Velais Client Dashboard

A full-stack sprint management dashboard that connects to Azure DevOps and displays work items across Kanban, table, and analytics views. Features a branded loading experience and animated login page.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, TanStack React Query, Recharts, GSAP
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
    kanban/           Kanban board (Board, Column, Card)
    table/            Table view with filters
    analytics/        Charts (StateBreakdown, ProgressSummary, AssigneeBreakdown)
    layout/           Shell (with project name in header) and SprintHeader
    Loader.tsx        Branded full-screen loading overlay with animated SVG logo
    LoginPage.tsx     Branded login page with GSAP entrance animations
  hooks/
    useStories.ts     React Query wrapper for stories
    useSummary.ts     React Query wrapper for sprint summary
    useCascadeAnimation.ts  GSAP page-entry cascade animation hook
  lib/
    gsap.ts           GSAP singleton: registers CustomEase, exports gsap + useGSAP
    logo.ts           Shared SVG viewBox and path constants for the Velais logo
    api.ts            API client
    utils.ts          Utilities and cn() helper

server/               Hono backend
  middleware/         Auth (WorkOS JWT) and caching (in-memory, 10-min TTL)
  routes/             stories, summary, iterations endpoints
  services/           Azure DevOps client and data transformation
  tenants.ts          Org-to-project/team mapping

shared/               Types and utilities shared between client and server

api/                  Vercel edge function catch-all
```

## Application Flow

The app renders in three sequential phases on every load:

1. **Loader** — Full-screen branded overlay shown while WorkOS auth resolves. Displays an animated SVG logo with a diagonal fill progress bar and a shimmer sweep. Cycles status messages and fades out once auth is ready.
2. **Login page** — Shown if no authenticated user is found. GSAP timeline animates the logo, wordmark, divider, subtitle, sign-in button, and footer into view in sequence.
3. **Dashboard** — The authenticated shell. A cascade animation slides the header in from above and staggers the title, stats, section labels, and cards into view.

## Architecture

### Authentication

Users authenticate via WorkOS AuthKit. The backend verifies JWT tokens on every API request and extracts the organization ID to determine the tenant context.

### Multi-Tenancy

Each organization maps to an Azure DevOps project and team via `server/tenants.ts`. Cache keys are scoped per-tenant to prevent data leaks. The resolved project name from `SprintSummary` is displayed in the dashboard header.

### Caching

The backend uses an in-memory cache with a 10-minute TTL, ETag support for conditional responses, and LRU eviction at 500 entries. The client layer uses React Query with a matching 10-minute stale time.

### Animations

GSAP (`gsap` + `@gsap/react`) drives all motion. The `CustomEase` plugin is registered globally via `src/lib/gsap.ts` with a `"snappy"` preset. Elements that participate in page-entry animations are marked with `data-gsap="<role>"` attributes and targeted by `useCascadeAnimation`. The `[data-gsap]` CSS selector applies `will-change: transform, opacity` for compositing layer promotion.

### Typography

- **Headings (`font-heading`):** Onsite Extended (self-hosted WOFF2/WOFF)
- **Body and mono (`font-body`, `font-mono`):** Host Grotesk (Google Fonts CDN)

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
