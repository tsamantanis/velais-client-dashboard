import { Hono } from "hono";
import type { AuthEnv } from "../middleware/auth.js";
import { fetchCurrentSprintStories } from "../services/sprint.js";

const stories = new Hono<AuthEnv>();

stories.get("/", async (c) => {
  const tenant = c.get("tenant");

  try {
    const { stories: clientStories } = await fetchCurrentSprintStories(tenant);
    return c.json(clientStories);
  } catch (err) {
    console.error("[stories] Azure DevOps error:", err);
    return c.json({ error: "Failed to fetch stories from Azure DevOps" }, 502);
  }
});

export default stories;
