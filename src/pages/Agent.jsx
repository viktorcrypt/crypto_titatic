// src/pages/Agent.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ensureCtx, sendCalls, makeCalldata, userOpTrackUrl } from "../lib/onchain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi";

export default function AgentPage() {
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [txUrl, setTxUrl] = useState("");

  const strategies = [
    {
      id: "balanced",
      title: "🧠 Balanced",
      desc: "Rescues a fair mix of strong and weak coins.",
      symbols: ["BTC", "ETH", "SOL", "DOGE"],
    },
    {
      id: "maxcap",
      title: "🚀 Max Market Cap",
      desc: "Focuses on top projects by capitalization.",
      symbols: ["BTC", "ETH", "BNB", "SOL"],
    },
    {
      id: "underdogs",
      title: "🐢 Underdogs",
      desc: "Prefers smaller, riskier coins — big heart energy.",
      symbols: ["DOGE", "LINK", "PEPE", "TON"],
    },
    {
      id: "random",
      title: "🎲 Random",
      desc: "Leaves it all to fate — totally random selection.",
      symbols: ["BTC", "ETH", "DOGE", "LINK", "SOL"],
    },
  ];

  async function handleDelegate() {
    if (!strategy) return setStatus("Please select a strategy first.");
    try {
      setLoading(true);
      setStatus("Deploying rescue agent…");

      const ctx = await ensureCtx();

      const symbols = strategies.find((s) => s.id === strategy).symbols;
      const data = makeCalldata(RESCUE_LOG_ABI, "logRescue", [
        symbols,
        100,
        true, 
        "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"),
      ]);

      const { hash } = await sendCalls(ctx, {
        to: RESCUE_LOG_ADDR,
        data,
      });

      const url = userOpTrackUrl(hash);
      setTxUrl(url);
      setStatus("✅ Agent rescue recorded on-chain!");
      setTimeout(() => navigate("/stats"), 2500);
    } catch (e) {
      console.error(e);
      setStatus(e?.message || "Agent failed to execute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Rescue Agent 🤖</h1>
          <Link
            to="/app"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20"
          >
            ← Back to ship
          </Link>
        </div>

        <p className="opacity-80 mb-6">
          Choose a rescue strategy — the agent will automatically decide which
          assets to save and submit a gasless record for you.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                strategy === s.id
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="text-lg font-semibold mb-1">{s.title}</div>
              <div className="opacity-80 text-sm">{s.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleDelegate}
          disabled={loading || !strategy}
          className={`w-full rounded-xl py-3 font-semibold transition ${
            loading
              ? "bg-slate-700 cursor-wait"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading ? "Deploying Agent…" : "Delegate to Agent 🤖"}
        </button>

        {status && (
          <div className="mt-4 text-sm opacity-80">
            {status}
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-sky-400 underline mt-1"
              >
                View userOp on Explorer →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
