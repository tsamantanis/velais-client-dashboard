import { useAuth } from "@workos-inc/authkit-react";
import { useState } from "react";
import { AssigneeBreakdown } from "./components/analytics/AssigneeBreakdown.js";
import { StateBreakdown } from "./components/analytics/StateBreakdown.js";
import { Board } from "./components/kanban/Board.js";
import { Shell } from "./components/layout/Shell.js";
import { StoriesTable } from "./components/table/StoriesTable.js";
import { useStories } from "./hooks/useStories.js";
import { useSummary } from "./hooks/useSummary.js";
import { setGetAccessToken } from "./lib/api.js";

export function App() {
  const {
    isLoading: authLoading,
    user,
    signIn,
    signOut,
    getAccessToken,
  } = useAuth();
  setGetAccessToken(getAccessToken);

  if (authLoading) {
    return (
      <Shell>
        <p className="text-gray-500">Loading...</p>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <h2 className="text-lg font-semibold">Welcome to Client Dashboard</h2>
          <p className="text-gray-500">Sign in to view your sprint data.</p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Sign In
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell user={user} onSignOut={() => signOut()}>
      <Dashboard />
    </Shell>
  );
}

function Dashboard() {
  const { data: stories, isLoading: storiesLoading } = useStories();
  const { data: summary } = useSummary();
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <>
      {summary && (
        <>
          <h3 className="mb-3 text-base font-semibold">Analytics</h3>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* <ProgressSummary summary={summary} /> */}
            <StateBreakdown byState={summary.byState} />
            <AssigneeBreakdown byAssignee={summary.byAssignee} />
          </div>
        </>
      )}

      <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
        <button
          type="button"
          onClick={() => setView("kanban")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "kanban"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "table"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Table
        </button>
      </div>

      {view === "kanban" ? (
        <Board stories={stories} isLoading={storiesLoading} />
      ) : (
        <StoriesTable stories={stories} isLoading={storiesLoading} />
      )}
    </>
  );
}
