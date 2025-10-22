// src/pages/Agent.jsx
import { Link } from "react-router-dom";

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Agent</h1>
          <Link
            to="/app"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20"
          >
            ← Back to ship
          </Link>
        </div>

        <p className="opacity-80">
          Soon: choose your strategy (e.g. “max market cap”, “underdogs”, “balanced”),
          the agent will auto-fill the lifeboat and submit a gasless record.
        </p>
      </div>
    </div>
  );
}
