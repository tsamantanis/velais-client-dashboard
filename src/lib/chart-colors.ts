import type { StoryState } from "@shared/types/index.js";

export const STATE_CHART_COLORS: Record<StoryState, string> = {
  Planned: "hsl(220, 9%, 60%)",
  "In Progress": "hsl(213, 94%, 55%)",
  "In Review": "hsl(45, 93%, 55%)",
  Completed: "hsl(142, 71%, 45%)",
  Blocked: "hsl(0, 84%, 60%)",
};

export const ASSIGNEE_COLORS = [
  "hsl(213, 94%, 55%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 67%, 55%)",
  "hsl(25, 95%, 55%)",
  "hsl(45, 93%, 55%)",
  "hsl(340, 82%, 55%)",
  "hsl(175, 80%, 40%)",
  "hsl(0, 84%, 60%)",
];
