import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi.js";
import { TOKENS } from "../lib/tokens.js";
import { Link } from "react-router-dom";

const SEPOLIA_RPC = import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const client = useMemo(
    () =>
      createPublicClient({
        chain: sepolia,
        transport: http(SEPOLIA_RPC),
      }),
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const symbols = TOKENS.map((t) => t.symbol);

        console.log("[Stats] Fetching counts for:", symbols);
        console.log("[Stats] Contract:", RESCUE_LOG_ADDR);

        const counts = await client.readContract({
          address: RESCUE_LOG_ADDR,
          abi: RESCUE_LOG_ABI,
          functionName: "getCounts",
          args: [symbols],
        });

        console.log("[Stats] Counts:", counts);

        // Fetch agent counts
        const agentCounts = await client.readContract({
          address: RESCUE_LOG_ADDR,
          abi: RESCUE_LOG_ABI,
          functionName: "getAgentCounts",
          args: [symbols],
        });

        console.log("[Stats] Agent counts:", agentCounts);

        const list = symbols.map((s, i) => ({
          symbol: s,
          count: Number(counts[i] ?? 0),
          agentCount: Number(agentCounts[i] ?? 0),
          humanCount: Number(counts[i] ?? 0) - Number(agentCounts[i] ?? 0),
        }));
        list.sort((a, b) => b.count - a.count);

        setRows(list);
      } catch (e) {
        console.error("[Stats] Error:", e);
        setErr(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [client]);

  return (
    <div className="min-h-screen bg-black text-white px-5 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          {/* back to ship (scene) */}
          <Link
            to="/app"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            ← Back to ship
          </Link>

          {/* jump to Agent page */}
          <Link
            to="/agent"
            className="rounded-lg px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 text-sm"
          >
            Agent strategies →
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Rescue Leaderboard 🏆</h1>
        <p className="text-white/70 mb-6">
          Live on-chain counts from Sepolia. Every rescue is a gasless UserOperation!
        </p>

        {loading && (
          <div className="flex items-center gap-2 opacity-80">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            Loading leaderboard...
          </div>
        )}
        
        {err && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="text-red-400 font-semibold mb-1">Failed to load</div>
            <div className="text-sm text-red-300">{err}</div>
          </div>
        )}

        {!loading && !err && rows.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🚢</div>
            <div className="text-lg font-semibold mb-2">No rescues yet!</div>
            <div className="text-white/60">Be the first to save some crypto from the Titanic.</div>
          </div>
        )}

        {!loading && !err && rows.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2 text-sm opacity-70">Human / Agent</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.symbol} className="odd:bg-white/0 even:bg-white/[0.03]">
                    <td className="px-4 py-2 opacity-70">{i + 1}</td>
                    <td className="px-4 py-2 font-semibold">
                      {r.symbol}
                      {i === 0 && " 🥇"}
                      {i === 1 && " 🥈"}
                      {i === 2 && " 🥉"}
                    </td>
                    <td className="px-4 py-2 text-emerald-400 font-semibold">{r.count}x</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="opacity-70">{r.humanCount}</span>
                      <span className="opacity-40 mx-1">/</span>
                      <span className="text-cyan-400">{r.agentCount} 🤖</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 space-y-2 text-sm opacity-70">
          <div>Contract: <code className="opacity-90 font-mono">{RESCUE_LOG_ADDR}</code></div>
          <div>Network: Sepolia Testnet</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All transactions are gasless via Pimlico Paymaster
          </div>
        </div>
      </div>
    </div>
  );
}
