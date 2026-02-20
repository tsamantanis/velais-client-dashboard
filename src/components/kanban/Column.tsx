import type { ClientStory, StoryState } from "@shared/types/index.js";
import { ScrollArea } from "../ui/scroll-area.js";
import { KanbanCard } from "./Card.js";

interface ColumnProps {
  state: StoryState;
  stories: ClientStory[];
}

export function Column({ state, stories }: ColumnProps) {
  return (
    <div
      data-gsap="card"
      className="flex min-w-[220px] flex-1 flex-col bg-bg-panel border border-border-subtle rounded-md p-2"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold tracking-[0.06em] uppercase text-text-secondary">
          {state}
        </span>
        <span className="flex h-5 min-w-5 items-center justify-center bg-bg-surface border border-border-subtle text-text-secondary rounded-sm text-xs px-1">
          {stories.length}
        </span>
      </div>
      <ScrollArea className="max-h-[calc(100vh-260px)]">
        <div className="flex flex-col gap-2">
          {stories.map((story) => (
            <div key={story.id} className="kanban-card">
              <KanbanCard story={story} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
