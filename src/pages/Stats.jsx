import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi.js";
import { TOKENS } from "../lib/tokens.js";
import { Link } from "react-router-dom";

const RPC =
  import.meta.env.VITE_MONAD_RPC || "https://monad-testnet.drpc.org";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const client = useMemo(
    () =>
      createPublicClient({
        chain: monadTestnet,
        transport: http(RPC),
      }),
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const symbols = TOKENS.map((t) => t.symbol);

        // читаем оба набора данных
        const [counts, agentCounts] = await Promise.all([
          client.readContract({
            address: RESCUE_LOG_ADDR,
            abi: RESCUE_LOG_ABI,
            functionName: "getCounts",
            args: [symbols],
          }),
          client.readContract({
            address: RESCUE_LOG_ADDR,
            abi: RESCUE_LOG_ABI,
            functionName: "getAgentCounts",
            args: [symbols],
          }),
        ]);

        // собираем таблицу
        const list = symbols.map((s, i) => ({
          symbol: s,
          total: Number(counts[i] ?? 0),
          agent: Number(agentCounts[i] ?? 0),
        }));

        list.sort((a, b) => b.total - a.total);
        setRows(list);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [client]);

  return (
    <div className="min-h-screen bg-black text-white px-5 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link
            to="/"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            ← Back to ship
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Rescue Leaderboard</h1>
        <p className="text-white/70 mb-6">
          Live on-chain counts. 💠 marks AI-picked rescues.
        </p>

        {loading && <div className="opacity-80">Loading…</div>}
        {err && <div className="text-red-400 mb-3">{err}</div>}

        {!loading && !err && (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Saved</th>
                  <th className="px-4 py-2">AI-picked 💠</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.symbol}
                    className="odd:bg-white/0 even:bg-white/[0.03]"
                  >
                    <td className="px-4 py-2 opacity-70">{i + 1}</td>
                    <td className="px-4 py-2 font-semibold">{r.symbol}</td>
                    <td className="px-4 py-2">{r.total}</td>
                    <td className="px-4 py-2 text-emerald-400">
                      {r.agent > 0 ? `${r.agent}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-sm opacity-70">
          Contract: <code className="opacity-90">{RESCUE_LOG_ADDR}</code>
        </div>
      </div>
    </div>
  );
}
