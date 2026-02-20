import { Hono } from "hono";
import { logger } from "hono/logger";
import type { AuthEnv } from "./middleware/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { cacheMiddleware } from "./middleware/cache.js";
import iterations from "./routes/iterations.js";
import stories from "./routes/stories.js";
import summary from "./routes/summary.js";
import { getCurrentIteration } from "./services/azure-devops.js";
import { tenantMap } from "./tenants.js";

const app = new Hono<AuthEnv>().basePath("/api");

app.use(logger());

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/health/azure", async (c) => {
  const firstTenant = Object.values(tenantMap)[0];
  if (!firstTenant) {
    return c.json({ status: "error", error: "No tenants configured" }, 500);
  }
  try {
    const iteration = await getCurrentIteration(
      firstTenant.project,
      firstTenant.team,
    );
    return c.json({
      status: "ok",
      currentIteration: iteration?.name ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ status: "error", error: message }, 502);
  }
});

app.use("*", authMiddleware);
app.use("*", cacheMiddleware());

app.route("/stories", stories);
app.route("/summary", summary);
app.route("/iterations", iterations);

app.onError((err, c) => {
  console.error("[api] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
