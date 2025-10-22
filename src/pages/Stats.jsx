// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/leaderboard";
import { Link } from "react-router-dom";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { rows, recent } = await fetchLeaderboard();
        setRows(rows);
        setRecent(recent);
      } catch (e) {
        setErr(e?.message || "Failed to load leaderboard");
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

        {loading && <div className="opacity-80">Loading…</div>}
        {err && <div className="text-red-400">{err}</div>}

        {!loading && !err && (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Top rescued coins</h2>
              {rows.length === 0 ? (
                <div className="opacity-70">No data yet.</div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Rescues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.symbol} className="border-t border-white/10">
                          <td className="px-4 py-3 opacity-70">{i + 1}</td>
                          <td className="px-4 py-3 font-medium">{r.symbol}</td>
                          <td className="px-4 py-3">{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Recent rescues</h2>
              {recent.length === 0 ? (
                <div className="opacity-70">No rescues yet.</div>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="text-sm opacity-80">
                        by {short(r.by)} • block {r.blockNumber?.toString?.()}
                      </div>
                      <div className="mt-1">
                        {r.symbols.join(", ")}
                        {r.byAgent ? " • by agent" : ""}
                      </div>
                      {r.txHash && (
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${r.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 underline text-sm"
                        >
                          View tx
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function short(addr = "") {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}
