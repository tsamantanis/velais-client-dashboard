import { Hono } from "hono";
import type { AuthEnv } from "../middleware/auth.js";
import { fetchCurrentSprintStories } from "../services/sprint.js";
import { buildSummary } from "../services/transform.js";

const summary = new Hono<AuthEnv>();

summary.get("/", async (c) => {
  const tenant = c.get("tenant");

  try {
    const { stories, iteration } = await fetchCurrentSprintStories(tenant);
    if (!iteration) {
      return c.json({ error: "No active sprint found" }, 404);
    }

    const sprintSummary = buildSummary(stories, {
      projectName: tenant.project,
      name: iteration.name,
      startDate: iteration.attributes.startDate,
      endDate: iteration.attributes.finishDate,
    });

    return c.json(sprintSummary);
  } catch (err) {
    console.error("[summary] Azure DevOps error:", err);
    return c.json({ error: "Failed to fetch summary from Azure DevOps" }, 502);
  }
});

export default summary;
