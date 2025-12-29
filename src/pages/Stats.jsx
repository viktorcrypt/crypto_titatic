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

        const counts = await client.readContract({
          address: RESCUE_LOG_ADDR,
          abi: RESCUE_LOG_ABI,
          functionName: "getCounts",
          args: [symbols],
        });

        const agentCounts = await client.readContract({
          address: RESCUE_LOG_ADDR,
          abi: RESCUE_LOG_ABI,
          functionName: "getAgentCounts",
          args: [symbols],
        });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/app"
            className="group flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Ship
          </Link>

          <Link
            to="/agent"
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 rounded-xl transition"
          >
            <span className="text-sm font-medium">Agent Strategies</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full mb-6">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-semibold text-yellow-300">Live Rescue Leaderboard</span>
          </div>
          
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
            Crypto Titanic Leaderboard
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Real-time on-chain rescue statistics from Sepolia testnet.
            <br />
            <span className="text-emerald-400">Every rescue is a gasless UserOperation powered by Pimlico! ⚡</span>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-white/60">Loading rescue data...</p>
          </div>
        )}
        
        {/* Error State */}
        {err && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="text-red-300 font-bold text-lg mb-1">Failed to load leaderboard</div>
                <div className="text-sm text-red-200/80">{err}</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !err && rows.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">🚢</div>
            <div className="text-2xl font-bold mb-3">No rescues recorded yet!</div>
            <div className="text-white/60 text-lg">Be the first hero to save crypto from the Titanic.</div>
            <Link to="/app" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-semibold transition transform hover:scale-105">
              Start Rescue Mission →
            </Link>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !err && rows.length > 0 && (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {rows.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="pt-8">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition transform hover:scale-105">
                    <div className="text-4xl mb-3">🥈</div>
                    <div className="text-3xl font-black mb-2">{rows[1].symbol}</div>
                    <div className="text-2xl font-bold text-slate-300 mb-3">{rows[1].count} rescues</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-white/60">{rows[1].humanCount} 👤</span>
                      <span className="text-white/30">•</span>
                      <span className="text-cyan-400">{rows[1].agentCount} 🤖</span>
                    </div>
                  </div>
                </div>

                {/* 1st Place - Taller */}
                <div className="pt-0">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl p-8 text-center hover:border-yellow-500/50 transition transform hover:scale-105 shadow-2xl shadow-yellow-500/20">
                    <div className="text-5xl mb-3 animate-bounce">🥇</div>
                    <div className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">{rows[0].symbol}</div>
                    <div className="text-3xl font-bold text-emerald-400 mb-4">{rows[0].count} rescues</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-white/60">{rows[0].humanCount} 👤</span>
                      <span className="text-white/30">•</span>
                      <span className="text-cyan-400">{rows[0].agentCount} 🤖</span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="pt-12">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition transform hover:scale-105">
                    <div className="text-4xl mb-3">🥉</div>
                    <div className="text-3xl font-black mb-2">{rows[2].symbol}</div>
                    <div className="text-2xl font-bold text-slate-300 mb-3">{rows[2].count} rescues</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-white/60">{rows[2].humanCount} 👤</span>
                      <span className="text-white/30">•</span>
                      <span className="text-cyan-400">{rows[2].agentCount} 🤖</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of the leaderboard */}
            {rows.length > 3 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-white/5 to-white/10 px-6 py-4 border-b border-white/10">
                  <h3 className="font-bold text-lg">Full Rankings</h3>
                </div>
                
                <div className="divide-y divide-white/5">
                  {rows.slice(3).map((r, i) => (
                    <div
                      key={r.symbol}
                      className="px-6 py-4 hover:bg-white/5 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-white/60 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 group-hover:text-white transition">
                            #{i + 4}
                          </div>
                          <div>
                            <div className="text-xl font-bold">{r.symbol}</div>
                            <div className="text-sm text-white/40">Token Symbol</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-400">{r.count}</div>
                            <div className="text-xs text-white/40">Total Rescues</div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{r.humanCount}</div>
                              <div className="text-xs text-white/40">👤 Human</div>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-cyan-400">{r.agentCount}</div>
                              <div className="text-xs text-cyan-400/60">🤖 Agent</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show simple list if less than 3 items */}
            {rows.length < 3 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                {rows.map((r, i) => (
                  <div
                    key={r.symbol}
                    className="px-6 py-5 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {i === 0 && "🥇"}
                          {i === 1 && "🥈"}
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{r.symbol}</div>
                          <div className="text-sm text-white/40">Token Symbol</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-emerald-400">{r.count}</div>
                          <div className="text-xs text-white/40">Rescues</div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{r.humanCount}</div>
                            <div className="text-xs text-white/40">👤</div>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-cyan-400">{r.agentCount}</div>
                            <div className="text-xs text-cyan-400/60">🤖</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/40 mb-2">Smart Contract</div>
              <code className="text-xs font-mono text-cyan-400 break-all">{RESCUE_LOG_ADDR}</code>
            </div>
            
            <div>
              <div className="text-sm text-white/40 mb-2">Network Status</div>
              <div className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50"></span>
                <span className="text-sm font-medium">Sepolia Testnet • Gasless via Pimlico</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
