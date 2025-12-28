// src/pages/Agent.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ensureCtx, sendCalls, makeCalldata, userOpTrackUrl } from "../lib/onchain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi";
import { getAllAgents, executeAgentStrategy } from "../lib/agents";

export default function AgentPage() {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStats, setAgentStats] = useState({ runs: 0, lastRun: null, nextRun: null });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Load active agent from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crypto_titanic_active_agent');
    if (saved) {
      setActiveAgent(saved);
      const lastRun = localStorage.getItem('crypto_titanic_agent_last_run');
      const runs = parseInt(localStorage.getItem('crypto_titanic_agent_runs') || '0');
      setAgentStats({
        runs,
        lastRun: lastRun ? new Date(parseInt(lastRun)) : null,
        nextRun: lastRun ? new Date(parseInt(lastRun) + 60 * 60 * 1000) : null,
      });
    }
  }, []);

  // Agent interval - runs every hour
  useEffect(() => {
    if (!activeAgent) return;

    console.log('[Agent] Setting up interval for:', activeAgent);

    // Set interval for every hour (will start after first manual run in startAgent)
    const interval = setInterval(() => {
      console.log('[Agent] Interval tick, executing rescue');
      executeAgentRescue(activeAgent);
    }, 60 * 60 * 1000); // 1 hour

    return () => {
      console.log('[Agent] Clearing interval');
      clearInterval(interval);
    };
  }, [activeAgent]);

  async function executeAgentRescue(agentId) {
    try {
      console.log('[Agent] Executing rescue for:', agentId);
      setStatus(`🤖 Agent running: ${agentId}...`);

      // Get agent strategy
      const { coins, agentName } = executeAgentStrategy(agentId);
      
      console.log('[Agent] Selected coins:', coins);

      // Get context
      const ctx = await ensureCtx();

      // Create calldata for logRescue with byAgent = true
      const selectionHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      const data = makeCalldata(RESCUE_LOG_ABI, "logRescue", [
        coins,
        100,
        true, // byAgent = true!
        selectionHash,
      ]);

      // Send rescue operation (regular UserOp, no delegation needed)
      const hash = await ctx.bundlerClient.sendUserOperation({
        account: ctx.sessionAccount,
        calls: [{
          to: RESCUE_LOG_ADDR,
          data,
          value: 0n,
        }],
        ...(await ctx.pimlicoClient.getUserOperationGasPrice()).fast,
      });

      console.log('[Agent] Rescue sent! Hash:', hash);

      // Update stats
      const now = Date.now();
      const runs = parseInt(localStorage.getItem('crypto_titanic_agent_runs') || '0') + 1;
      localStorage.setItem('crypto_titanic_agent_last_run', now.toString());
      localStorage.setItem('crypto_titanic_agent_runs', runs.toString());

      setAgentStats({
        runs,
        lastRun: new Date(now),
        nextRun: new Date(now + 60 * 60 * 1000),
      });

      setStatus(`✅ Agent rescued: ${coins.join(', ')}`);
    } catch (e) {
      console.error('[Agent] Error:', e);
      setStatus(`❌ Agent failed: ${e.message}`);
    }
  }

  async function startAgent(agentId) {
    try {
      setLoading(true);
      setStatus(`Starting agent: ${agentId}...`);

      // Save active agent
      localStorage.setItem('crypto_titanic_active_agent', agentId);
      setActiveAgent(agentId);

      // Execute first rescue immediately
      await executeAgentRescue(agentId);

      setStatus(`✅ Agent ${agentId} started!`);
    } catch (e) {
      console.error('[Agent] Start error:', e);
      setStatus(`❌ Failed to start: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function stopAgent() {
    localStorage.removeItem('crypto_titanic_active_agent');
    localStorage.removeItem('crypto_titanic_agent_last_run');
    localStorage.removeItem('crypto_titanic_agent_runs');
    setActiveAgent(null);
    setAgentStats({ runs: 0, lastRun: null, nextRun: null });
    setStatus('Agent stopped');
  }

  const agents = getAllAgents();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Rescue Agents 🤖</h1>
          <Link
            to="/app"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20"
          >
            ← Back to ship
          </Link>
        </div>

        {/* Active Agent Status */}
        {activeAgent ? (
          <div className="mb-8 p-6 rounded-2xl border border-emerald-400 bg-emerald-400/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold mb-1">
                  ✅ Agent Active: {agents.find(a => a.id === activeAgent)?.name}
                </div>
                <div className="text-sm opacity-70">
                  The agent is running automatically every hour
                </div>
              </div>
              <button
                onClick={stopAgent}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-sm"
              >
                Stop Agent
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="opacity-70">Total Rescues</div>
                <div className="text-lg font-bold">{agentStats.runs}</div>
              </div>
              <div>
                <div className="opacity-70">Last Run</div>
                <div className="text-lg font-bold">
                  {agentStats.lastRun ? agentStats.lastRun.toLocaleTimeString() : '—'}
                </div>
              </div>
              <div>
                <div className="opacity-70">Next Run</div>
                <div className="text-lg font-bold">
                  {agentStats.nextRun ? agentStats.nextRun.toLocaleTimeString() : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="opacity-80 mb-6">
            Choose an agent strategy to automatically rescue tokens every hour.
            The agent will run in the background and record rescues on-chain.
          </p>
        )}

        {/* Agent Selection */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => !loading && !activeAgent && startAgent(agent.id)}
              disabled={loading || activeAgent}
              className={`text-left rounded-2xl border p-4 transition-all ${
                activeAgent === agent.id
                  ? "border-emerald-400 bg-emerald-400/10"
                  : activeAgent
                  ? "border-white/10 opacity-50 cursor-not-allowed"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="text-lg font-semibold mb-1">{agent.name}</div>
              <div className="opacity-80 text-sm">{agent.description}</div>
              <div className="text-xs opacity-60 mt-2">
                Runs every {agent.interval / 1000 / 60} minutes
              </div>
            </button>
          ))}
        </div>

        {/* Status */}
        {status && (
          <div className="mt-4 p-4 rounded-xl bg-white/5 text-sm">
            {status}
          </div>
        )}

        {/* Instructions */}
        {!activeAgent && (
          <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sm">
            <div className="font-semibold mb-2">ℹ️ How it works:</div>
            <ul className="space-y-1 opacity-80">
              <li>• Select an agent strategy to activate</li>
              <li>• Agent will execute rescue operations automatically every hour</li>
              <li>• All rescues are marked as "by agent" on the leaderboard</li>
              <li>• You can stop the agent at any time</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
