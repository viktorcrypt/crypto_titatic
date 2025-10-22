// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPublicClient, http, decodeEventLog } from "viem";
import { monadTestnet } from "../lib/chain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi";

// Используем твой текущий RPC (Alchemy или DRPC)
const RPC = import.meta.env.VITE_MONAD_RPC;
const client = createPublicClient({ chain: monadTestnet, transport: http(RPC) });

export default function StatsPage() {
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrs("");

        // Получаем номер последнего блока
        const latest = await client.getBlockNumber();

        // Берём последние 1000 блоков (чтобы не упереться в лимит)
        const start = latest > 1000n ? latest - 1000n : 0n;
        const CHUNK = 10n; // по 10 блоков за раз

        const allLogs = [];
        for (let from = start; from <= latest; from += CHUNK) {
          const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;
          try {
            const logs = await client.getLogs({
              address: RESCUE_LOG_ADDR,
              fromBlock: from,
              toBlock: to,
            });
            allLogs.push(...logs);
          } catch (e) {
            console.warn("getLogs chunk failed", { from, to, e });
          }
        }

        // Декодим события Rescued
        const symbolCounts = new Map();

        for (const log of allLogs) {
          try {
            const ev = decodeEventLog({
              abi: RESCUE_LOG_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (ev.eventName !== "Rescued") continue;

            const { symbols } = ev.args;
            if (Array.isArray(symbols)) {
              for (const s of symbols) {
                const key = String(s);
                symbolCounts.set(key, (symbolCounts.get(key) ?? 0) + 1);
              }
            }
          } catch (_) {
            // не Rescued — пропускаем
          }
        }

        const table = [...symbolCounts.entries()]
          .map(([symbol, count]) => ({ symbol, count }))
          .sort((a, b) => b.count - a.count);

        setRows(table);
        if (table.length === 0) {
          setErrs("No Rescued events found in the last 1000 blocks.");
        }
      } catch (e) {
        console.error(e);
        setErrs(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Rescue Leaderboard</h1>
          <Link
            to="/app"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20"
          >
            ← Back to ship
          </Link>
        </div>

        {loading && <div className="opacity-80">Loading logs…</div>}

        {errs && (
          <div className="mt-3 text-red-300">
            {errs}
            <div className="mt-2 text-sm opacity-80">
              Note: Free RPC providers like DRPC or Alchemy limit the block range.
              We already chunk requests into 10-block batches.
            </div>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Saved count</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.symbol} className="odd:bg-white/[0.02]">
                    <td className="px-4 py-3 w-12">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">{r.symbol}</td>
                    <td className="px-4 py-3">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length === 0 && !errs && (
          <div className="opacity-80">No data yet.</div>
        )}
      </div>
    </div>
  );
}
