import type { Priority, StoryState } from "@shared/types/index.js";

export const STATE_COLORS: Record<StoryState, string> = {
  Planned: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "In Review": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Blocked: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-blue-100 text-blue-700",
  Unset: "bg-gray-100 text-gray-500",
};

export const STATE_ORDER: StoryState[] = [
  "Planned",
  "In Progress",
  "In Review",
  "Completed",
  "Blocked",
];
