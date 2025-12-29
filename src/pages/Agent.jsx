import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ensureCtx, makeCalldata } from "../lib/onchain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "../lib/rescueAbi";
import { getAllAgents, executeAgentStrategy } from "../lib/agents";


const AGENT_EMOJIS = {
  'random': '🎲',
  'balanced': '⚖️',
  'maxCap': '📈',
  'underdog': '🎗️',
  'momentum': '📊',
};

export default function AgentPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStats, setAgentStats] = useState({ runs: 0, lastRun: null, nextRun: null });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  
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

  
  useEffect(() => {
    if (!activeAgent) return;

    console.log('[Agent] Setting up interval for:', activeAgent);

    const interval = setInterval(() => {
      console.log('[Agent] Interval tick, executing rescue');
      executeAgentRescue(activeAgent);
    }, 60 * 60 * 1000); 

    return () => {
      console.log('[Agent] Clearing interval');
      clearInterval(interval);
    };
  }, [activeAgent]);

  async function executeAgentRescue(agentId) {
    try {
      console.log('[Agent] Executing rescue for:', agentId);
      setStatus(`🤖 Agent running: ${agentId}...`);

      const { coins, agentName } = await executeAgentStrategy(agentId);
      console.log('[Agent] Selected coins:', coins);

      const ctx = await ensureCtx();

      const selectionHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      const data = makeCalldata(RESCUE_LOG_ABI, "logRescue", [
        coins,
        100,
        true, 
        selectionHash,
      ]);

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

      localStorage.setItem('crypto_titanic_active_agent', agentId);
      setActiveAgent(agentId);

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
  const hasPermission = isConnected && !!window._smartAccountContext;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Rescue Agents 🤖
            </h1>
            <p className="text-white/60">Automated rescue strategies powered by ERC-7715</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/stats" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition">
              📊 Leaderboard
            </Link>
            <Link to="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition">
              ← Home
            </Link>
          </div>
        </div>

        {!isConnected ? (
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8 text-center backdrop-blur-xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-3">Wallet Not Connected</h3>
            <p className="text-white/70 mb-6">Please connect your wallet to activate agent strategies.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold transition">
              Connect Wallet
            </button>
          </div>
        ) : !hasPermission ? (
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-8 text-center backdrop-blur-xl">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold mb-3">Session Account Required</h3>
            <p className="text-white/70 mb-6">Please complete the boarding process first.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-semibold transition">
              Go to Boarding
            </button>
          </div>
        ) : (
          <>
            {activeAgent ? (
              <div className="mb-8 p-6 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold mb-1 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                      Agent Active: {agents.find(a => a.id === activeAgent)?.name}
                    </div>
                    <div className="text-sm text-white/70">Running automatically every hour • All rescues gasless</div>
                  </div>
                  <button onClick={stopAgent} className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 font-semibold transition">
                    Stop Agent
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-white/60 mb-1">Total Rescues</div>
                    <div className="text-2xl font-bold text-emerald-400">{agentStats.runs}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-white/60 mb-1">Last Run</div>
                    <div className="text-lg font-semibold">{agentStats.lastRun ? agentStats.lastRun.toLocaleTimeString() : '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-white/60 mb-1">Next Run</div>
                    <div className="text-lg font-semibold">{agentStats.nextRun ? agentStats.nextRun.toLocaleTimeString() : '—'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <p className="text-white/80">Choose an agent strategy to automatically rescue tokens every hour.<br /><span className="text-white/60">The agent will run in the background and record rescues on-chain.</span></p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => !loading && !activeAgent && startAgent(agent.id)}
                  disabled={loading || activeAgent}
                  className={`group text-left rounded-2xl border p-6 transition-all transform ${
                    activeAgent === agent.id
                      ? "border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-green-500/20 scale-105"
                      : activeAgent
                      ? "border-white/10 opacity-40 cursor-not-allowed"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5 hover:scale-105"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{AGENT_EMOJIS[agent.id] || '🤖'}</div>
                    {activeAgent === agent.id && <div className="text-emerald-400 text-sm font-semibold">✅ ACTIVE</div>}
                  </div>
                  
                  <div className="text-xl font-bold mb-2">{agent.name}</div>
                  <div className="text-white/70 text-sm mb-3">{agent.description}</div>
                  
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Runs every {agent.interval / 1000 / 60} minutes
                  </div>
                </button>
              ))}
            </div>

            {status && (
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-sm">{status}</div>
            )}

            {!activeAgent && (
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">ℹ️</span>
                  <div>
                    <div className="font-bold text-lg mb-3">How Agent Strategies Work</div>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start gap-2"><span className="text-cyan-400">•</span><span>Select an agent strategy to activate automated rescues</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-400">•</span><span>Agent executes rescue operations automatically every hour</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-400">•</span><span>All rescues are marked as "by agent" on the leaderboard 🤖</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-400">•</span><span>Gasless transactions powered by Pimlico Paymaster ✨</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-400">•</span><span>You can stop the agent at any time</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`.delay-1000 { animation-delay: 1s; }`}</style>
    </div>
  );
}
