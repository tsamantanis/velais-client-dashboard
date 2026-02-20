# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velais Client Dashboard — a full-stack sprint management app that fetches Azure DevOps work items and displays them in an interactive dashboard (Kanban, table, and analytics views). Uses WorkOS for authentication and Hono for the backend API.

## Commands

```bash
bun install                    # Install dependencies
bun run dev                    # Run client (:5173) + server (:3001) concurrently
bun run dev:client             # Vite dev server only
bun run dev:server             # Hono backend only (bun --watch)
bun run build                  # tsc --noEmit && vite build
bun run lint                   # biome check .
bun run format                 # biome check --fix .
```

## Architecture

**Tech stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 + TanStack React Query | Hono backend | Bun runtime

### Directory Layout

- `src/` — React client app
  - `components/ui/` — shadcn-style primitives (card, chart, Avatar, Badge, Skeleton)
  - `components/kanban/` — Kanban board (Board → Column → Card)
  - `components/table/` — Table view with filters
  - `components/analytics/` — Recharts dashboard (StateBreakdown, ProgressSummary, AssigneeBreakdown)
  - `components/layout/` — Shell wrapper and SprintHeader
  - `hooks/` — `useStories`, `useSummary` (React Query wrappers)
  - `lib/` — API client, query-client config, utilities, constants
- `server/` — Hono backend
  - `middleware/auth.ts` — WorkOS JWT verification
  - `middleware/cache.ts` — In-memory cache (10-min TTL, ETag, LRU at 500 entries)
  - `routes/` — `stories`, `summary`, `iterations` endpoints
  - `services/azure-devops.ts` — Azure DevOps WIQL client
  - `services/transform.ts` — Work item → ClientStory transformation
  - `tenants.ts` — Org ID → Azure DevOps project/team mapping
- `shared/` — Types and utilities shared between client and server
  - `types/index.ts` — `ClientStory`, `SprintSummary`, `StoryState`, `Priority`, etc.
- `api/[[...route]].ts` — Vercel edge function catch-all (proxies to Hono app)

### Data Flow

```
React hooks (useStories/useSummary)
  → React Query (10-min stale time)
    → /api/* endpoints
      → Auth middleware (WorkOS JWT)
        → Cache middleware (hit → 304/cached response)
          → Azure DevOps API (WIQL queries)
            → Transform service (normalize states/priorities)
```

### Multi-Tenancy

Org ID from JWT maps to tenant config in `server/tenants.ts`, which determines the Azure DevOps project and team. Cache keys are per-tenant to prevent cross-tenant data leaks.

### Path Aliases

- `@/*` → `./src/*`
- `@shared/*` → `./shared/*`

### Key Patterns

- **Formatting:** Biome with 2-space indent, double quotes
- **Styling:** Tailwind utilities + `cn()` helper (clsx + twMerge)
- **shadcn UI:** New York style, configured via `components.json`
- **API auth:** Bearer token in Authorization header, verified via WorkOS on every request
- **State mapping:** Azure DevOps states → normalized `StoryState` (Planned, In Progress, Review, Testing, Done, Removed)
- **Error flow:** API 401 → redirect to home; Azure errors → 502

### Environment Variables

See `.env.example`. Required: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `VITE_WORKOS_CLIENT_ID`, `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PAT`.

### Deployment

Vercel — `vercel.json` rewrites `/api/*` to the Hono edge function and `/*` to the Vite-built frontend.
